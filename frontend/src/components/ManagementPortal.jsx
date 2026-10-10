import React, { useState } from 'react';
import {
  TrendingUp, Users, GraduationCap, DollarSign, Briefcase,
  Building, BookOpen, BarChart2, Calendar, CheckCircle,
  Download, LogOut, ArrowUpRight, Shield, FileCheck,
  PieChart, AlertCircle, Bus, FlaskConical, UserCheck,
  Bell, ChevronRight, Star, Activity, Layers, Award,
  Globe, Settings, Eye, ClipboardList, TrendingDown, Menu, X, FileSpreadsheet, MessageSquare
} from 'lucide-react';
import ReportGenerationModule from './ReportGenerationModule.jsx';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import './ManagementPortal.css';

const DEPT_DATA = [
  { name: 'Computer Science & Engg (CSE)', code: 'CSE', hod: 'Dr. P. K. Pattnaik', students: 540, faculty: 32, cgpa: 8.42, attendance: 91.2, placement: 94.6, feeRecovery: 96.2, pass: 97.1, scholarships: 42 },
  { name: 'AI & Machine Learning (AIML)', code: 'AIML', hod: 'Dr. S. K. Swain', students: 360, faculty: 22, cgpa: 8.28, attendance: 89.8, placement: 91.2, feeRecovery: 94.4, pass: 96.0, scholarships: 28 },
  { name: 'Electronics & Comm. (ECE)', code: 'ECE', hod: 'Dr. M. R. Senapati', students: 380, faculty: 24, cgpa: 8.10, attendance: 88.6, placement: 86.2, feeRecovery: 93.5, pass: 94.8, scholarships: 22 },
  { name: 'Electrical & Electronics (EEE)', code: 'EEE', hod: 'Dr. S. K. Das', students: 290, faculty: 18, cgpa: 7.85, attendance: 87.4, placement: 78.0, feeRecovery: 91.0, pass: 92.4, scholarships: 18 },
  { name: 'Mechanical Engineering (MECH)', code: 'MECH', hod: 'Dr. B. K. Rout', students: 320, faculty: 22, cgpa: 7.68, attendance: 86.0, placement: 74.5, feeRecovery: 89.4, pass: 90.6, scholarships: 14 },
  { name: 'Civil Engineering (CIVIL)', code: 'CIVIL', hod: 'Dr. A. K. Nayak', students: 240, faculty: 16, cgpa: 7.72, attendance: 85.2, placement: 72.0, feeRecovery: 88.0, pass: 89.2, scholarships: 10 },
  { name: 'MBA (Business Administration)', code: 'MBA', hod: 'Dr. Rashmi Mohanty', students: 180, faculty: 14, cgpa: 7.90, attendance: 90.4, placement: 88.0, feeRecovery: 95.0, pass: 95.0, scholarships: 8 },
  { name: 'MCA (Computer Applications)', code: 'MCA', hod: 'Dr. T. P. Tripathy', students: 180, faculty: 12, cgpa: 8.02, attendance: 91.0, placement: 87.5, feeRecovery: 94.2, pass: 95.6, scholarships: 12 },
];

const PLACEMENT_DRIVES = [
  { company: 'Tata Consultancy Services (TCS Digital)', role: 'System Engineer / Digital Specialist', ctc: '₹7.5 LPA', registered: 210, shortlisted: 84, selected: 28, status: 'Active', dept: 'CSE, AIML, ECE' },
  { company: 'Infosys Power Programmer', role: 'Specialist Programmer', ctc: '₹9.5 LPA', registered: 165, shortlisted: 42, selected: 14, status: 'Active', dept: 'CSE, AIML' },
  { company: 'Deloitte USI Technology', role: 'Analyst — Technology Consulting', ctc: '₹8.2 LPA', registered: 240, shortlisted: 95, selected: 31, status: 'Completed', dept: 'CSE, AIML, ECE, MCA' },
  { company: 'L&T Technology Services', role: 'Graduate Engineer Trainee', ctc: '₹6.0 LPA', registered: 180, shortlisted: 60, selected: 22, status: 'Ongoing', dept: 'ECE, EEE, MECH, CIVIL' },
  { company: 'Wipro NLTH', role: 'Project Engineer', ctc: '₹5.8 LPA', registered: 190, shortlisted: 70, selected: 25, status: 'Completed', dept: 'CSE, ECE, MCA' },
];

const APPROVALS = [
  { id: 'APP-001', title: 'Annual Lab Equipment Upgrade Budget (₹48,00,000)', dept: 'All Engineering Depts', by: 'Dr. S. Mohanty (Planning Head)', priority: 'High', status: 'Pending', date: '04 Oct 2026', category: 'Capital Expenditure' },
  { id: 'APP-002', title: 'MoU with Cisco Systems for Center of Excellence in IoT', dept: 'Academic Council', by: 'Training & Placement Office', priority: 'High', status: 'Pending', date: '03 Oct 2026', category: 'Strategic Partnership' },
  { id: 'APP-003', title: 'Solar Power Grid Expansion Phase II — 150 kW Capacity', dept: 'Campus Operations', by: 'Chief Estate Officer', priority: 'Medium', status: 'Approved', date: '01 Oct 2026', category: 'Infrastructure' },
  { id: 'APP-004', title: 'Research Publication Incentive Scheme ₹12,00,000 (FY 2026-27)', dept: 'Research & Development Cell', by: 'Dean of Research (Dr. P. R. Jena)', priority: 'Medium', status: 'Pending', date: '02 Oct 2026', category: 'Research' },
  { id: 'APP-005', title: 'New Girls Hostel Block — Phase 3 Construction Clearance', dept: 'Infrastructure & Hostel Admin', by: 'Chief Warden Mrs. Nibedita Das', priority: 'High', status: 'Under Review', date: '30 Sep 2026', category: 'Infrastructure' },
  { id: 'APP-006', title: 'Faculty Exchange Program with IIT Bhubaneswar (2026-27)', dept: 'All Departments', by: 'Principal Dr. Sujit Khuntia', priority: 'Low', status: 'Approved', date: '28 Sep 2026', category: 'Academic' },
];

const FEE_DATA = [
  { dept: 'CSE', total: '₹5.29 Cr', collected: '₹5.09 Cr', due: '₹20.3 L', pct: 96.2 },
  { dept: 'AIML', total: '₹3.51 Cr', collected: '₹3.32 Cr', due: '₹19.1 L', pct: 94.4 },
  { dept: 'ECE', total: '₹3.71 Cr', collected: '₹3.47 Cr', due: '₹24.1 L', pct: 93.5 },
  { dept: 'EEE', total: '₹2.83 Cr', collected: '₹2.58 Cr', due: '₹25.7 L', pct: 91.0 },
  { dept: 'MECH', total: '₹3.12 Cr', collected: '₹2.79 Cr', due: '₹33.4 L', pct: 89.4 },
  { dept: 'CIVIL', total: '₹2.34 Cr', collected: '₹2.06 Cr', due: '₹28.5 L', pct: 88.0 },
  { dept: 'MBA', total: '₹1.75 Cr', collected: '₹1.66 Cr', due: '₹8.8 L', pct: 95.0 },
  { dept: 'MCA', total: '₹1.75 Cr', collected: '₹1.65 Cr', due: '₹10.3 L', pct: 94.2 },
];

const NOTICES = [
  { tag: 'REGULATORY', title: 'NAAC Accreditation Cycle IV Preparatory Inspection — Final Review', date: '05 Oct 2026', priority: 'Critical' },
  { tag: 'ACADEMIC', title: 'Academic Calendar 2026-27 (Odd Semester) — Approved & Published', date: '01 Oct 2026', priority: 'High' },
  { tag: 'FINANCE', title: 'FY 2026-27 Budget Utilization Report — Q2 Submitted to Trust Board', date: '30 Sep 2026', priority: 'Medium' },
  { tag: 'PLACEMENT', title: 'Campus Placement Season 2026-27 Officially Commenced — 18 Companies Confirmed', date: '28 Sep 2026', priority: 'High' },
];

// ─── Export Utilities ────────────────────────────────────────────────────────

function downloadCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
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
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 32px; background: #fff; font-size: 13px; }
        h1 { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #64748b; margin-bottom: 24px; }
        h2 { font-size: 14px; font-weight: 700; margin: 24px 0 10px; color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #eff6ff; color: #1e40af; padding: 8px 10px; text-align: left; font-weight: 700; border: 1px solid #bfdbfe; }
        td { padding: 7px 10px; border: 1px solid #e2e8f0; color: #334155; }
        tr:nth-child(even) td { background: #f8faff; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi-box { border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; background: #eff6ff; }
        .kpi-label { font-size: 10px; color: #3b82f6; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
        .kpi-value { font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 4px 0 2px; }
        .kpi-sub { font-size: 10px; color: #64748b; }
        .footer { margin-top: 32px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        @media print { .no-print { display: none; } body { padding: 16px; } }
      </style>
    </head>
    <body>
      <h1>Apna Campus — ${title}</h1>
      <div class="meta">Governing Body / Board of Trustees &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; FY 2026-27</div>
      ${htmlBody}
      <div class="footer">This report is auto-generated by the College ERP System and is for Governing Body reference only. &copy; Apna Campus 2026.</div>
      <br/>
      <button class="no-print" onclick="window.print()" style="background:#1d4ed8;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">🖨 Print / Save as PDF</button>
    </body>
    </html>
  `);
  win.document.close();
}

function exportExecutiveReport() {
  const kpiHtml = `
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-label">Total Students</div><div class="kpi-value">${DEPT_DATA.reduce((s,d)=>s+d.students,0).toLocaleString()}</div><div class="kpi-sub">+4.2% YoY Intake</div></div>
      <div class="kpi-box"><div class="kpi-label">Faculty Strength</div><div class="kpi-value">${DEPT_DATA.reduce((s,d)=>s+d.faculty,0)}</div><div class="kpi-sub">1:17 Faculty-Student Ratio</div></div>
      <div class="kpi-box"><div class="kpi-label">Fee Realization</div><div class="kpi-value">\u20B924.6 Cr</div><div class="kpi-sub">92.5% Collected</div></div>
      <div class="kpi-box"><div class="kpi-label">Placement %</div><div class="kpi-value">${(DEPT_DATA.reduce((s,d)=>s+d.placement,0)/DEPT_DATA.length).toFixed(1)}%</div><div class="kpi-sub">Avg \u20B96.8 LPA</div></div>
      <div class="kpi-box"><div class="kpi-label">Avg CGPA</div><div class="kpi-value">${(DEPT_DATA.reduce((s,d)=>s+d.cgpa,0)/DEPT_DATA.length).toFixed(2)}</div><div class="kpi-sub">Autonomous 2026</div></div>
      <div class="kpi-box"><div class="kpi-label">Avg Attendance</div><div class="kpi-value">${(DEPT_DATA.reduce((s,d)=>s+d.attendance,0)/DEPT_DATA.length).toFixed(1)}%</div><div class="kpi-sub">Biometric Sync</div></div>
      <div class="kpi-box"><div class="kpi-label">Pass Rate</div><div class="kpi-value">94.2%</div><div class="kpi-sub">End-Sem 2026</div></div>
      <div class="kpi-box"><div class="kpi-label">Hostel Occupancy</div><div class="kpi-value">88.0%</div><div class="kpi-sub">880 / 1,000 Beds</div></div>
    </div>`;
  const deptRows = DEPT_DATA.map(d => `<tr><td><b>${d.name}</b></td><td>${d.hod}</td><td>${d.students}</td><td>${d.faculty}</td><td>${d.cgpa}</td><td>${d.attendance}%</td><td>${d.placement}%</td><td>${d.feeRecovery}%</td><td>${d.pass}%</td></tr>`).join('');
  const tableHtml = `
    <h2>Department-Wise Performance</h2>
    <table><thead><tr><th>Department</th><th>HOD</th><th>Students</th><th>Faculty</th><th>CGPA</th><th>Attendance</th><th>Placement %</th><th>Fee Recovery</th><th>Pass Rate</th></tr></thead>
    <tbody>${deptRows}</tbody></table>`;
  openPrintReport('Executive Summary Report', kpiHtml + tableHtml);
}

function exportDeptCSV() {
  downloadCSV(
    'Apna_Campus_Department_Analytics_2026-27.csv',
    ['Department', 'Code', 'HOD', 'Students', 'Faculty', 'Avg CGPA', 'Attendance %', 'Placement %', 'Fee Recovery %', 'Pass Rate %', 'Scholarships'],
    DEPT_DATA.map(d => [d.name, d.code, d.hod, d.students, d.faculty, d.cgpa, d.attendance, d.placement, d.feeRecovery, d.pass, d.scholarships])
  );
}

function exportFeeCSV() {
  downloadCSV(
    'GIFT_Fee_Realization_2026-27.csv',
    ['Department', 'Total Fee Demand', 'Fee Collected', 'Outstanding Due', 'Recovery %'],
    FEE_DATA.map(f => [f.dept, f.total, f.collected, f.due, f.pct + '%'])
  );
}

function exportPlacementCSV() {
  downloadCSV(
    'GIFT_Placement_Drives_2026-27.csv',
    ['Company', 'Role', 'CTC Offered', 'Registered', 'Shortlisted', 'Selected', 'Eligible Depts', 'Status'],
    PLACEMENT_DRIVES.map(d => [d.company, d.role, d.ctc, d.registered, d.shortlisted, d.selected, d.dept, d.status])
  );
}

function exportApprovalsCSV(approvalsData) {
  downloadCSV(
    'GIFT_Strategic_Approvals_2026-27.csv',
    ['ID', 'Title', 'Department', 'Submitted By', 'Category', 'Priority', 'Date', 'Status'],
    approvalsData.map(a => [a.id, a.title, a.dept, a.by, a.category, a.priority, a.date, a.status])
  );
}

function exportGovernanceReport() {
  const compRows = [
    ['NAAC', 'Self Study Report & Peer Team Visit', 'Approved', 'Nov 2026', '98%'],
    ['NBA', 'Programme Outcomes & Exit Survey Reports', 'Active', 'Mar 2027', '95%'],
    ['AICTE', 'Annual Compliance Report & Fee Approval', 'Approved', 'Oct 2026', '100%'],
    ['UGC', 'Autonomous Status Renewal Application', 'Ongoing', 'Dec 2026', '88%'],
    ['BPUT', 'Affiliation Renewal & Exam Calendar', 'Approved', 'Sep 2026', '100%'],
  ].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td></tr>`).join('');
  const html = `
    <h2>Regulatory & Accreditation Compliance</h2>
    <table><thead><tr><th>Body</th><th>Requirement</th><th>Status</th><th>Due</th><th>Compliance</th></tr></thead><tbody>${compRows}</tbody></table>
    <h2>Active Institutional Notices</h2>
    <table><thead><tr><th>Tag</th><th>Notice</th><th>Date</th><th>Priority</th></tr></thead>
    <tbody>${NOTICES.map(n=>`<tr><td>${n.tag}</td><td>${n.title}</td><td>${n.date}</td><td>${n.priority}</td></tr>`).join('')}</tbody></table>`;
  openPrintReport('Governance & Compliance Report', html);
}

const ProgressBar = ({ value, color = '#2563eb' }) => (
  <div className="mgmt-progress-bg">
    <div className="mgmt-progress-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    'Pending':      'mgmt-status mgmt-status-warning',
    'Approved':     'mgmt-status mgmt-status-success',
    'Under Review': 'mgmt-status mgmt-status-info',
    'Active':       'mgmt-status mgmt-status-success',
    'Ongoing':      'mgmt-status mgmt-status-info',
    'Completed':    'mgmt-status mgmt-status-neutral',
    'Rejected':     'mgmt-status mgmt-status-danger',
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

const KPI = ({ label, value, sub, icon, color = '#2563eb', bg = '#eff6ff', topBar, trend }) => (
  <div className="mgmt-kpi">
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
        {trend === 'down' ? <TrendingDown size={13} /> : trend === 'neutral' ? <Activity size={13} /> : <ArrowUpRight size={13} />}
        {sub}
      </div>
    )}
  </div>
);

export default function ManagementPortal({ account, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');
  const [approvals, setApprovals] = useState(APPROVALS);
  const [toast, setToast] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleApprove = (id) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    showToast(`✅ Proposal ${id} approved by Governing Body!`);
  };

  const handleReject = (id) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    showToast(`Proposal ${id} returned for revision.`);
  };

  const totalStudents = DEPT_DATA.reduce((s, d) => s + d.students, 0);
  const totalFaculty  = DEPT_DATA.reduce((s, d) => s + d.faculty, 0);
  const avgCgpa       = (DEPT_DATA.reduce((s, d) => s + d.cgpa, 0) / DEPT_DATA.length).toFixed(2);
  const avgAttendance = (DEPT_DATA.reduce((s, d) => s + d.attendance, 0) / DEPT_DATA.length).toFixed(1);
  const avgPlacement  = (DEPT_DATA.reduce((s, d) => s + d.placement, 0) / DEPT_DATA.length).toFixed(1);
  const totalSelected = PLACEMENT_DRIVES.reduce((s, d) => s + d.selected, 0);

  const navItems = [
    { id: 'executive',    label: 'Executive Overview',       icon: <PieChart size={17} /> },
    { id: 'departments',  label: 'Department Analytics',     icon: <Building size={17} /> },
    { id: 'financials',   label: 'Fee & Finance',            icon: <DollarSign size={17} /> },
    { id: 'placements',   label: 'Placement & Careers',      icon: <Briefcase size={17} /> },
    { id: 'approvals',    label: 'Strategic Approvals',      icon: <FileCheck size={17} /> },
    { id: 'governance',   label: 'Governance & Notices',     icon: <Shield size={17} /> },
    { id: 'campus-connect', label: 'Campus Connect (WhatsApp)', icon: <MessageSquare size={17} /> },
    { id: 'report-generation', label: 'Report Generation',   icon: <FileSpreadsheet size={17} /> },
  ];

  const pendingCount = approvals.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;

  return (
    <div className="mgmt-layout">

      {/* Toast */}
      {toast && (
        <div className="mgmt-toast">
          <CheckCircle size={17} /> {toast}
        </div>
      )}

      {/* ─── Sidebar ─────────────────────────────── */}
      {sidebarOpen && (
        <aside className="mgmt-sidebar">
          <div className="mgmt-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="mgmt-brand-icon" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="mgmt-brand-text">
                <h2>Apna Campus</h2>
                <span>Governing Body Portal</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(15, 23, 42, 0.08)',
                border: 'none',
                color: '#64748b',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mgmt-user-card" style={{ margin: '0.85rem 0.85rem 0' }}>
            <div className="mgmt-user-info">
              <div className="mgmt-user-avatar">GP</div>
              <div>
                <span className="mgmt-user-name">{account?.name || 'Shri Patitapaban Panda'}</span>
                <span className="mgmt-user-role">Managing Trustee · Governing Body</span>
              </div>
            </div>
          </div>

          <nav className="mgmt-nav">
            <div className="mgmt-nav-section">Main Navigation</div>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`mgmt-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'approvals' && pendingCount > 0 && (
                  <span style={{
                    background: '#ef4444', color: '#fff',
                    borderRadius: '999px', padding: '1px 7px',
                    fontSize: '0.68rem', fontWeight: 800,
                  }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* ─── Main ────────────────────────────────── */}
      <main className="mgmt-main">
        <header className="mgmt-header">
          <div className="mgmt-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1>Institutional Governance & Strategic Intelligence</h1>
              <p>Apna Campus · Governing Body / Board of Trustees · FY 2026-27</p>
            </div>
          </div>
          <div className="mgmt-header-right">
            <span className="mgmt-badge">
              <Shield size={12} /> Governance View Only
            </span>
            {pendingCount > 0 && (
              <span className="mgmt-badge mgmt-badge-warning">
                <Bell size={12} /> {pendingCount} Pending Approvals
              </span>
            )}
            <button
              className="mgmt-btn mgmt-btn-secondary"
              onClick={() => {
                if (activeTab === 'executive')   { exportExecutiveReport(); showToast('Opening Executive Report — use Print > Save as PDF'); }
                else if (activeTab === 'departments') { exportDeptCSV(); showToast('Downloaded: GIFT_Department_Analytics_2026-27.csv'); }
                else if (activeTab === 'financials')  { exportFeeCSV(); showToast('Downloaded: GIFT_Fee_Realization_2026-27.csv'); }
                else if (activeTab === 'placements')  { exportPlacementCSV(); showToast('Downloaded: GIFT_Placement_Drives_2026-27.csv'); }
                else if (activeTab === 'approvals')   { exportApprovalsCSV(approvals); showToast('Downloaded: GIFT_Strategic_Approvals_2026-27.csv'); }
                else if (activeTab === 'governance')  { exportGovernanceReport(); showToast('Opening Governance Report — use Print > Save as PDF'); }
              }}
            >
              <Download size={14} /> Export Report
            </button>

            {/* Top-Right Campus OS User Profile Pill with Sign Out */}
            <div className="campus-user-pill">
              <div className="campus-user-avatar">GP</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Shri Patitapaban Panda'}</strong>
                <small>Management • Governing Body</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="mgmt-body">

          {/* ═══════════════════════════════════════
              TAB 1: EXECUTIVE OVERVIEW
          ═══════════════════════════════════════ */}
          {activeTab === 'executive' && (
            <div>
              {/* Row 1 — Core KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI label="Total Students" value={totalStudents.toLocaleString()} sub="+4.2% YoY Intake" icon={<Users />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
                <KPI label="Faculty Strength" value={totalFaculty} sub="1:17 Faculty-Student Ratio" icon={<GraduationCap />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" trend="neutral" />
                <KPI label="Fee Realization" value="₹24.6 Cr" sub="92.5% Collected · ₹1.9 Cr Due" icon={<DollarSign />} color="#d97706" bg="#fefce8" topBar="linear-gradient(90deg, #d97706, #fbbf24)" />
                <KPI label="Placement Conversion" value={`${avgPlacement}%`} sub="Highest ₹24 LPA · Avg ₹6.8 LPA" icon={<Briefcase />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
              </div>

              {/* Row 2 — Secondary KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI label="Avg. Campus CGPA" value={avgCgpa} sub="Autonomous Grading 2026" icon={<Star />} color="#0891b2" bg="#ecfeff" topBar="linear-gradient(90deg, #0891b2, #22d3ee)" trend="up" />
                <KPI label="Avg. Attendance" value={`${avgAttendance}%`} sub="Biometric campus-wide sync" icon={<Calendar />} color="#16a34a" bg="#f0fdf4" topBar="linear-gradient(90deg, #16a34a, #4ade80)" />
                <KPI label="Hostel Occupancy" value="88.0%" sub="880 / 1,000 Beds Occupied" icon={<Building />} color="#db2777" bg="#fdf2f8" topBar="linear-gradient(90deg, #db2777, #f9a8d4)" trend="neutral" />
                <KPI label="Autonomous Pass Rate" value="94.2%" sub="End-Sem Exam 2026 Result" icon={<Award />} color="#ea580c" bg="#fff7ed" topBar="linear-gradient(90deg, #ea580c, #fb923c)" />
              </div>

              {/* Row 3 — Additional Stats */}
              <div className="mgmt-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                <KPI label="Library Volumes" value="32,450" sub="4,120 Active Circulations" icon={<BookOpen />} color="#0891b2" bg="#ecfeff" topBar="linear-gradient(90deg, #0891b2, #22d3ee)" trend="neutral" />
                <KPI label="Research Papers" value="87" sub="Published · 23 Scopus/WoS" icon={<Globe />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Bus Fleet" value="36" sub="Routes Covering 18 Zones" icon={<Bus />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" trend="neutral" />
                <KPI label="Lab Equipment" value="240+" sub="92.5% Operational Uptime" icon={<FlaskConical />} color="#ea580c" bg="#fff7ed" topBar="linear-gradient(90deg, #ea580c, #fb923c)" trend="neutral" />
                <KPI label="Companies Visited" value="42" sub="FY 2026-27 Campus Drive" icon={<UserCheck />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
                <KPI label="Scholarships Awarded" value="154" sub="₹82.4 L Disbursed YTD" icon={<Award />} color="#d97706" bg="#fefce8" topBar="linear-gradient(90deg, #d97706, #fbbf24)" />
              </div>

              {/* Department Summary Table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department-Wise Academic & Financial Performance</h3>
                    <p>Consolidated metrics for all 8 autonomous departments — Current Semester 2026-27</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={() => { exportDeptCSV(); showToast('Downloaded: Apna_Campus_Department_Analytics_2026-27.csv'); }}>
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
                        <th>Avg CGPA</th>
                        <th>Attendance</th>
                        <th>Placement %</th>
                        <th>Fee Recovery</th>
                        <th>Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DEPT_DATA.map(d => (
                        <tr key={d.code}>
                          <td><strong>{d.name}</strong></td>
                          <td style={{ color: '#475569' }}>{d.hod}</td>
                          <td><strong>{d.students}</strong></td>
                          <td>{d.faculty}</td>
                          <td>
                            <strong style={{ color: d.cgpa >= 8.0 ? '#059669' : d.cgpa >= 7.5 ? '#d97706' : '#ef4444' }}>
                              {d.cgpa}
                            </strong>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 3 }}>{d.attendance}%</div>
                            <ProgressBar value={d.attendance} color={d.attendance >= 90 ? '#059669' : d.attendance >= 85 ? '#d97706' : '#ef4444'} />
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 2: DEPARTMENT ANALYTICS
          ═══════════════════════════════════════ */}
          {activeTab === 'departments' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Department Strength & Analytics</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Comparative academic performance across all autonomous departments</p>
                </div>
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
                >
                  <option value="All">All Departments</option>
                  {DEPT_DATA.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {DEPT_DATA.filter(d => deptFilter === 'All' || d.code === deptFilter).map(dept => (
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
                          <h3 style={{ fontSize: '0.9rem' }}>{dept.name}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="mgmt-panel-body" style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                        {[
                          { label: 'Students', value: dept.students, color: '#2563eb' },
                          { label: 'Faculty', value: dept.faculty, color: '#059669' },
                          { label: 'Avg CGPA', value: dept.cgpa, color: '#7c3aed' },
                          { label: 'Scholarships', value: dept.scholarships, color: '#d97706' },
                        ].map(stat => (
                          <div key={stat.label} style={{
                            background: '#f8faff', borderRadius: 8, padding: '0.65rem 0.85rem',
                            border: '1px solid rgba(15,23,42,0.06)',
                          }}>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {[
                        { label: 'Attendance', val: dept.attendance, color: dept.attendance >= 90 ? '#059669' : '#d97706' },
                        { label: 'Placement', val: dept.placement, color: '#7c3aed' },
                        { label: 'Fee Recovery', val: dept.feeRecovery, color: '#2563eb' },
                        { label: 'Pass Rate', val: dept.pass, color: '#ea580c' },
                      ].map(bar => (
                        <div key={bar.label} className="mgmt-metric-bar">
                          <div className="mgmt-metric-bar-label">{bar.label}</div>
                          <div className="mgmt-metric-bar-track">
                            <div className="mgmt-progress-bg">
                              <div className="mgmt-progress-fill" style={{ width: `${bar.val}%`, background: bar.color }} />
                            </div>
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

          {/* ═══════════════════════════════════════
              TAB 3: FEE & FINANCE
          ═══════════════════════════════════════ */}
          {activeTab === 'financials' && (
            <div>
              {/* Summary KPIs */}
              <div className="mgmt-kpi-grid">
                <KPI label="Total Fee Collected" value="₹24.6 Cr" sub="+8.4% vs. last year" icon={<DollarSign />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
                <KPI label="Outstanding Dues" value="₹1.92 Cr" sub="From 312 student accounts" icon={<AlertCircle />} color="#dc2626" bg="#fef2f2" topBar="linear-gradient(90deg, #dc2626, #f87171)" trend="warn" />
                <KPI label="Scholarships Disbursed" value="₹82.4 L" sub="154 beneficiaries · FY 2026-27" icon={<Award />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Overall Fee Recovery" value="92.5%" sub="Target: 95% by semester end" icon={<TrendingUp />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
              </div>

              {/* Fee by Department */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department-Wise Fee Realization</h3>
                    <p>Semester fee collection status across all departments — Q2 FY 2026-27</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={() => { exportFeeCSV(); showToast('Downloaded: GIFT_Fee_Realization_2026-27.csv'); }}>
                    <Download size={14} /> Download CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total Demand</th>
                        <th>Collected</th>
                        <th>Outstanding</th>
                        <th>Recovery %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FEE_DATA.map(f => (
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

              {/* Summary stats row */}
              <div className="mgmt-grid-2">
                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Revenue Breakdown</h3>
                      <p>By fee category — FY 2026-27</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    {[
                      { label: 'Tuition & Development Fee', val: '₹14.2 Cr', pct: 57.8, color: '#2563eb' },
                      { label: 'Examination & Affiliation', val: '₹3.8 Cr', pct: 15.4, color: '#7c3aed' },
                      { label: 'Hostel & Mess Charges', val: '₹4.6 Cr', pct: 18.7, color: '#059669' },
                      { label: 'Lab & Library Fee', val: '₹1.4 Cr', pct: 5.7, color: '#ea580c' },
                      { label: 'Transport & Bus Pass', val: '₹0.6 Cr', pct: 2.4, color: '#d97706' },
                    ].map(item => (
                      <div key={item.label} className="mgmt-metric-bar">
                        <div className="mgmt-metric-bar-label">{item.label}</div>
                        <div className="mgmt-metric-bar-track">
                          <ProgressBar value={item.pct} color={item.color} />
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', width: 60, textAlign: 'right' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Scholarship Programs</h3>
                      <p>Active schemes & disbursements</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    {[
                      { name: 'Odisha State Merit-Cum-Means', students: 48, amount: '₹24.0 L', type: 'State Govt.' },
                      { name: 'PRERANA SC/ST Scholarship', students: 34, amount: '₹16.2 L', type: 'State Govt.' },
                      { name: 'GIFT Management Endowment', students: 26, amount: '₹18.5 L', type: 'Institutional' },
                      { name: 'AICTE National Scholarship', students: 22, amount: '₹13.8 L', type: 'Central Govt.' },
                      { name: 'Industry-Sponsored (TCS, Infosys)', students: 24, amount: '₹9.9 L', type: 'Corporate' },
                    ].map(s => (
                      <div key={s.name} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.7rem 0', borderBottom: '1px solid rgba(15,23,42,0.05)',
                      }}>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.students} students · {s.type}</div>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>{s.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 4: PLACEMENT & CAREERS
          ═══════════════════════════════════════ */}
          {activeTab === 'placements' && (
            <div>
              <div className="mgmt-kpi-grid">
                <KPI label="Companies On-Campus" value="42" sub="FY 2026-27 Season" icon={<Building />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" />
                <KPI label="Students Placed" value={totalSelected} sub={`Avg. Package ₹6.8 LPA`} icon={<UserCheck />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
                <KPI label="Highest Package" value="₹24 LPA" sub="Sprinklr — CSE Student" icon={<Star />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="Overall Placement %" value={`${avgPlacement}%`} sub="Up from 78.4% last year" icon={<TrendingUp />} color="#ea580c" bg="#fff7ed" topBar="linear-gradient(90deg, #ea580c, #fb923c)" />
              </div>

              {/* Drives table */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Campus Recruitment Drives — FY 2026-27</h3>
                    <p>Corporate hiring activity overview for Governing Body visibility</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={() => { exportPlacementCSV(); showToast('Downloaded: GIFT_Placement_Drives_2026-27.csv'); }}>
                    <Download size={14} /> Download CSV
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>CTC Offered</th>
                        <th>Registered</th>
                        <th>Shortlisted</th>
                        <th>Selected</th>
                        <th>Eligible Depts</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLACEMENT_DRIVES.map(d => (
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

              {/* Dept-wise placement bars */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Department-Wise Placement Conversion Rate</h3>
                    <p>Percentage of graduates placed in FY 2026-27</p>
                  </div>
                </div>
                <div className="mgmt-panel-body">
                  {DEPT_DATA.map(d => (
                    <div key={d.code} className="mgmt-metric-bar">
                      <div className="mgmt-metric-bar-label">{d.code}</div>
                      <div style={{ flex: 1, margin: '0 1rem' }}>
                        <ProgressBar value={d.placement} color={d.placement >= 90 ? '#059669' : d.placement >= 80 ? '#2563eb' : d.placement >= 70 ? '#d97706' : '#ef4444'} />
                      </div>
                      <div className="mgmt-metric-bar-val">{d.placement}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              TAB 5: STRATEGIC APPROVALS
          ═══════════════════════════════════════ */}
          {activeTab === 'approvals' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Strategic Approval Queue</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>Capital expenditures, institutional partnerships, and statutory proposals</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="mgmt-badge">
                    <CheckCircle size={12} /> {approvals.filter(a => a.status === 'Approved').length} Approved
                  </span>
                  <span className="mgmt-badge mgmt-badge-warning">
                    <AlertCircle size={12} /> {pendingCount} Awaiting Action
                  </span>
                </div>
              </div>

              <div className="mgmt-panel">
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Proposal Title & Scope</th>
                        <th>Department</th>
                        <th>Submitted By</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map(item => (
                        <tr key={item.id}>
                          <td><strong style={{ color: '#2563eb' }}>{item.id}</strong></td>
                          <td style={{ maxWidth: 260 }}>
                            <strong style={{ fontSize: '0.83rem' }}>{item.title}</strong>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.dept}</td>
                          <td style={{ fontSize: '0.78rem', color: '#475569' }}>{item.by}</td>
                          <td>
                            <span className="mgmt-status mgmt-status-info" style={{ fontSize: '0.68rem' }}>{item.category}</span>
                          </td>
                          <td><PriorityBadge priority={item.priority} /></td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>{item.date}</td>
                          <td><StatusBadge status={item.status} /></td>
                          <td>
                            {(item.status === 'Pending' || item.status === 'Under Review') ? (
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                                <button
                                  className="mgmt-btn mgmt-btn-success"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleApprove(item.id)}
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button
                                  className="mgmt-btn mgmt-btn-danger"
                                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                  onClick={() => handleReject(item.id)}
                                >
                                  Return
                                </button>
                              </div>
                            ) : item.status === 'Approved' ? (
                              <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={13} /> Approved
                              </span>
                            ) : (
                              <span style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700 }}>Returned</span>
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

          {/* ═══════════════════════════════════════
              TAB 6: GOVERNANCE & NOTICES
          ═══════════════════════════════════════ */}
          {activeTab === 'governance' && (
            <div>
              <div className="mgmt-kpi-grid">
                <KPI label="NAAC Grade" value="A+" sub="Cycle IV Reaccreditation 2026" icon={<Award />} color="#7c3aed" bg="#f5f3ff" topBar="linear-gradient(90deg, #7c3aed, #a78bfa)" />
                <KPI label="NBA Accredited Depts" value="5 / 8" sub="CSE, ECE, EEE, MECH, CIVIL" icon={<CheckCircle />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" trend="neutral" />
                <KPI label="Board Meetings (FY)" value="6" sub="Last: 28 Sep 2026" icon={<ClipboardList />} color="#2563eb" bg="#eff6ff" topBar="linear-gradient(90deg, #2563eb, #60a5fa)" trend="neutral" />
                <KPI label="Regulatory Compliance" value="98.4%" sub="AICTE, BPUT, UGC norms met" icon={<Shield />} color="#059669" bg="#ecfdf5" topBar="linear-gradient(90deg, #059669, #34d399)" />
              </div>

              <div className="mgmt-grid-2">
                {/* Notices */}
                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Important Institutional Circulars</h3>
                      <p>Regulatory, academic, and financial notices</p>
                    </div>
                    <span className="mgmt-badge">
                      <Bell size={12} /> {NOTICES.length} Active
                    </span>
                  </div>
                  <div className="mgmt-panel-body" style={{ padding: '0.75rem 1rem' }}>
                    {NOTICES.map((n, i) => (
                      <div key={i} style={{
                        padding: '0.85rem 1rem',
                        border: '1px solid rgba(15,23,42,0.07)',
                        borderRadius: 10,
                        marginBottom: '0.65rem',
                        background: '#f8faff',
                        cursor: 'default',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <PriorityBadge priority={n.priority} />
                          <span style={{
                            background: '#eff6ff', color: '#1d4ed8',
                            borderRadius: 5, padding: '2px 7px',
                            fontSize: '0.68rem', fontWeight: 800,
                          }}>{n.tag}</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{n.title}</div>
                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: 600 }}>{n.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Governance Milestones */}
                <div className="mgmt-panel" style={{ marginBottom: 0 }}>
                  <div className="mgmt-panel-header">
                    <div className="mgmt-panel-title">
                      <h3>Governance Milestones — 2026-27</h3>
                      <p>Board decisions and institutional achievements</p>
                    </div>
                  </div>
                  <div className="mgmt-panel-body">
                    <div className="mgmt-timeline">
                      {[
                        { date: '05 Oct 2026', title: 'NAAC Cycle IV Preparatory Inspection', sub: 'Final documentation submitted', color: '#dc2626' },
                        { date: '01 Oct 2026', title: 'Academic Year 2026-27 Odd Sem Begins', sub: 'All 8 departments operational', color: '#059669' },
                        { date: '28 Sep 2026', title: 'Board of Governors Meeting — Q2', sub: 'Budget utilization reviewed and approved', color: '#2563eb' },
                        { date: '20 Sep 2026', title: 'Placement Season 2026-27 Inaugurated', sub: '42 companies confirmed, 18 visits scheduled', color: '#7c3aed' },
                        { date: '10 Sep 2026', title: 'ISO 9001:2015 Surveillance Audit Cleared', sub: 'Zero non-conformities recorded', color: '#059669' },
                        { date: '02 Sep 2026', title: 'MoU Signed with TCS & Infosys', sub: 'Scholarship and internship framework finalized', color: '#d97706' },
                        { date: '15 Aug 2026', title: 'Independence Day — Annual Scholarship Awards', sub: '154 students felicitated with merit awards', color: '#2563eb' },
                      ].map((item, i) => (
                        <div key={i} className="mgmt-timeline-item">
                          <div className="mgmt-timeline-dot" style={{ color: item.color, background: '#fff' }} />
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: 2 }}>{item.date}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* NAAC / Accreditation panel */}
              <div className="mgmt-panel">
                <div className="mgmt-panel-header">
                  <div className="mgmt-panel-title">
                    <h3>Regulatory & Accreditation Compliance Overview</h3>
                    <p>NAAC, NBA, AICTE, UGC, and BPUT compliance dashboard</p>
                  </div>
                  <button className="mgmt-btn mgmt-btn-secondary" onClick={() => { exportGovernanceReport(); showToast('Opening Governance Report — use Print > Save as PDF'); }}>
                    <Download size={14} /> Print / PDF
                  </button>
                </div>
                <div className="mgmt-table-wrap">
                  <table className="mgmt-table">
                    <thead>
                      <tr>
                        <th>Regulatory Body</th>
                        <th>Requirement</th>
                        <th>Current Status</th>
                        <th>Due Date</th>
                        <th>Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { body: 'NAAC', req: 'Self Study Report & Peer Team Visit', status: 'Approved', due: 'Nov 2026', comp: 98 },
                        { body: 'NBA', req: 'Programme Outcomes & Exit Survey Reports', status: 'Active', due: 'Mar 2027', comp: 95 },
                        { body: 'AICTE', req: 'Annual Compliance Report & Fee Approval', status: 'Approved', due: 'Oct 2026', comp: 100 },
                        { body: 'UGC', req: 'Autonomous Status Renewal Application', status: 'Ongoing', due: 'Dec 2026', comp: 88 },
                        { body: 'BPUT', req: 'Affiliation Renewal & Exam Calendar', status: 'Approved', due: 'Sep 2026', comp: 100 },
                      ].map(row => (
                        <tr key={row.body}>
                          <td><strong>{row.body}</strong></td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>{row.req}</td>
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
            </div>
          )}

          {/* TAB: REPORT GENERATION */}
          {activeTab === 'report-generation' && (
            <ReportGenerationModule account={account} role="management" />
          )}

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 120px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
