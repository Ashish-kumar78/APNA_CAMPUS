import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  FileText,
  UserCheck,
  Send,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Download,
  Calendar,
  X,
  RotateCcw,
  Check,
  Briefcase
} from 'lucide-react';

export default function ScholarshipApplicationsTab({
  applications,
  schemes,
  onUpdateApplications,
  onAddAuditLog,
  initialStatusFilter = 'All'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [schemeFilter, setSchemeFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // All | New | Renewal

  // Detail Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('profile'); // 10 tabs

  // Action Modals
  const [rejectionModal, setRejectionModal] = useState({ open: false, app: null, reason: '' });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New Application Registration Form State
  const [newAppForm, setNewAppForm] = useState({
    studentId: '2401432299',
    studentName: '',
    dept: 'Computer Science & Engineering',
    semester: 'Semester 3',
    cgpa: '8.50',
    annualFamilyIncome: '180000',
    category: 'OBC',
    gender: 'Male',
    schemeId: schemes[0]?.id || 'SCH-SCHEME-01',
    applicationType: 'New',
    reviewerRemarks: 'Applicant submitted income certificate and marks ledger directly at welfare counter.'
  });

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentId.includes(searchTerm) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.schemeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true :
      statusFilter === 'New' ? app.reviewStatus === 'Draft' || app.applicationType === 'New' :
      statusFilter === 'Review' ? app.reviewStatus === 'Under Review' :
      statusFilter === 'Approved' ? app.reviewStatus === 'Approved' :
      statusFilter === 'Rejected' ? app.reviewStatus === 'Rejected' :
      statusFilter === 'Waitlisted' ? app.reviewStatus === 'Waitlisted' :
      statusFilter === 'Verification' ? app.verificationStatus === 'Under Verification' || app.verificationStatus === 'Discrepancy Found' :
      app.reviewStatus === statusFilter;

    const matchesScheme = schemeFilter === 'All' ? true : app.schemeId === schemeFilter;
    const matchesDept = deptFilter === 'All' ? true : app.dept.includes(deptFilter);
    const matchesType = typeFilter === 'All' ? true : app.applicationType === typeFilter;

    return matchesSearch && matchesStatus && matchesScheme && matchesDept && matchesType;
  });

  // Actions
  const handleUpdateStatus = (appId, newReviewStatus, newApprovalStage, remarks = '') => {
    const updated = applications.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          reviewStatus: newReviewStatus,
          approvalStage: newApprovalStage || a.approvalStage,
          reviewerRemarks: remarks || a.reviewerRemarks,
          finalAwardAmount: newReviewStatus === 'Approved' ? (a.recommendedAmount || a.finalAwardAmount) : (newReviewStatus === 'Rejected' ? 0 : a.finalAwardAmount)
        };
      }
      return a;
    });

    onUpdateApplications(updated);

    if (selectedApp?.id === appId) {
      setSelectedApp(updated.find(a => a.id === appId));
    }

    onAddAuditLog({
      actionType: `APPLICATION_${newReviewStatus.toUpperCase().replace(/\s+/g, '_')}`,
      target: `${appId} (${applications.find(a => a.id === appId)?.studentName})`,
      details: `Status transitioned to ${newReviewStatus}. Note: ${remarks || 'Automated or reviewer transition.'}`
    });
  };

  const handleConfirmReject = () => {
    if (!rejectionModal.app) return;
    handleUpdateStatus(rejectionModal.app.id, 'Rejected', 'Application Rejected by Committee', rejectionModal.reason);
    setRejectionModal({ open: false, app: null, reason: '' });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const schemeObj = schemes.find(s => s.id === newAppForm.schemeId) || schemes[0];
    const newId = `APP-2026-${String(applications.length + 81).padStart(3, '0')}`;

    const newApplication = {
      id: newId,
      studentId: newAppForm.studentId,
      studentName: newAppForm.studentName,
      dept: newAppForm.dept,
      semester: newAppForm.semester,
      cgpa: Number(newAppForm.cgpa) || 7.0,
      annualFamilyIncome: Number(newAppForm.annualFamilyIncome) || 200000,
      category: newAppForm.category,
      gender: newAppForm.gender,
      schemeId: schemeObj.id,
      schemeName: schemeObj.name,
      applicationType: newAppForm.applicationType,
      submissionDate: 'Today, 11:30 AM',
      completeness: '100% Complete',
      eligibilityStatus: 'Screening In Progress',
      verificationStatus: 'Under Verification',
      reviewStatus: 'Under Review',
      approvalStage: 'Document Verification Desk',
      recommendedAmount: schemeObj.awardAmount,
      finalAwardAmount: 0,
      assignedReviewer: 'Dr. M. K. Mohapatra',
      disbursementStatus: 'Pending Verification',
      documentsCount: 4,
      reviewerRemarks: newAppForm.reviewerRemarks
    };

    onUpdateApplications([newApplication, ...applications]);
    setIsRegisterModalOpen(false);

    onAddAuditLog({
      actionType: 'NEW_APPLICATION_REGISTERED',
      target: `${newId} (${newAppForm.studentName})`,
      details: `Fresh ${newAppForm.applicationType} application registered under ${schemeObj.name}.`
    });
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Top Filter & Command Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, application ID, or scheme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            >
              <option value="All">All Schemes</option>
              {schemes.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">CSE / AIML</option>
              <option value="Electronics">ECE</option>
              <option value="Electrical">EEE</option>
              <option value="Mechanical">MECH</option>
              <option value="Civil">CIVIL</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
            >
              <option value="All">New & Renewals</option>
              <option value="New">Fresh New</option>
              <option value="Renewal">Continuing Renewal</option>
            </select>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle size={15} /> Register Application
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 flex-wrap">
          <span className="text-[11px] font-bold text-slate-500 mr-2 uppercase tracking-wider">
            Review Stages:
          </span>
          {[
            { id: 'All', label: 'All Applications' },
            { id: 'Verification', label: 'Under Verification' },
            { id: 'Review', label: 'Committee Review' },
            { id: 'Recommended', label: 'Recommended' },
            { id: 'Approved', label: 'Sanctioned / Approved' },
            { id: 'Waitlisted', label: 'Waitlisted' },
            { id: 'Rejected', label: 'Rejected' },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setStatusFilter(chip.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                statusFilter === chip.id
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-auto font-medium">
            Found {filteredApps.length} student records
          </span>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Application & Student</th>
                <th className="py-3 px-4">Scheme & Category</th>
                <th className="py-3 px-4">Academic & Income</th>
                <th className="py-3 px-4">Doc Verification</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Grant Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map(app => {
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50/40 transition group"
                  >
                    {/* App ID & Student */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {app.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>{app.id}</span>
                        <span>•</span>
                        <span>ID: {app.studentId}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{app.gender}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {app.dept} · {app.semester}
                      </div>
                    </td>

                    {/* Scheme */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="font-semibold text-slate-800 truncate" title={app.schemeName}>
                        {app.schemeName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {app.applicationType}
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                          {app.category}
                        </span>
                      </div>
                    </td>

                    {/* Academics & Income */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <span className="text-emerald-700">{app.cgpa} CGPA</span>
                        <span className="text-slate-400 text-[10px]">/ 10</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Family Inc: <strong className="text-slate-700">₹{(app.annualFamilyIncome / 100000).toFixed(2)}L</strong>
                      </div>
                    </td>

                    {/* Doc Verification Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        app.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        app.verificationStatus === 'Discrepancy Found' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {app.verificationStatus === 'Verified' ? <CheckCircle2 size={12} /> :
                         app.verificationStatus === 'Discrepancy Found' ? <XCircle size={12} /> :
                         <Clock size={12} />}
                        {app.verificationStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {app.documentsCount} documents registered
                      </div>
                    </td>

                    {/* Review Workflow Stage */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        app.reviewStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        app.reviewStatus === 'Recommended' ? 'bg-purple-100 text-purple-800' :
                        app.reviewStatus === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                        app.reviewStatus === 'Waitlisted' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {app.reviewStatus}
                      </span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5 font-medium" title={app.approvalStage}>
                        {app.approvalStage}
                      </div>
                    </td>

                    {/* Grant Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{(app.finalAwardAmount || app.recommendedAmount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {app.disbursementStatus}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold rounded-md transition text-xs flex items-center gap-1"
                        >
                          <Eye size={13} /> Review
                        </button>

                        {app.reviewStatus !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'Approved', 'Final Executive Sanction Granted')}
                            title="Quick Approve Award"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-md transition"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {app.reviewStatus !== 'Rejected' && (
                          <button
                            onClick={() => setRejectionModal({ open: true, app, reason: '' })}
                            title="Reject with Reason"
                            className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-md transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10-Tab Application Detail Inspection Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header with Progress Ribbon */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                    {selectedApp.id}
                  </span>
                  <span className="text-xs text-slate-300">
                    Session 2026–2027 · {selectedApp.applicationType}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedApp.studentName} — {selectedApp.schemeName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="bg-slate-800 px-5 py-2.5 text-xs border-b border-slate-700 flex items-center justify-between text-slate-300 overflow-x-auto gap-4">
              {[
                { label: '1. Submitted', active: true },
                { label: '2. Under Verification', active: selectedApp.verificationStatus === 'Verified' || selectedApp.reviewStatus !== 'Draft' },
                { label: '3. Committee Screening', active: selectedApp.reviewStatus === 'Under Review' || selectedApp.reviewStatus === 'Recommended' || selectedApp.reviewStatus === 'Approved' },
                { label: '4. Recommended', active: selectedApp.reviewStatus === 'Recommended' || selectedApp.reviewStatus === 'Approved' },
                { label: '5. Executive Sanction', active: selectedApp.reviewStatus === 'Approved' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={step.active ? 'text-white font-semibold' : 'text-slate-400'}>
                    {step.label}
                  </span>
                  {idx < 4 && <ChevronRight size={13} className="text-slate-600 ml-2" />}
                </div>
              ))}
            </div>

            {/* 10 Navigation Subtabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto text-xs py-1">
              {[
                { id: 'profile', label: '1. Student Profile' },
                { id: 'scheme', label: '2. Scheme Criteria' },
                { id: 'eligibility', label: '3. Eligibility Screening' },
                { id: 'academics', label: '4. Academic Records' },
                { id: 'financial', label: '5. Financial Info' },
                { id: 'documents', label: '6. Verification Docs' },
                { id: 'comments', label: '7. Reviewer Notes' },
                { id: 'decision', label: '8. Committee Decisions' },
                { id: 'award', label: '9. Award Details' },
                { id: 'timeline', label: '10. Activity Timeline' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition ${
                    activeDetailTab === tab.id
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Tab 1: Profile */}
              {activeDetailTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Student ID</span>
                      <strong className="text-slate-900 font-mono text-sm">{selectedApp.studentId}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                      <strong className="text-slate-900 text-sm">{selectedApp.dept}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Study Semester</span>
                      <strong className="text-slate-900 text-sm">{selectedApp.semester}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Reservation Category</span>
                      <strong className="text-slate-900 text-sm">{selectedApp.category}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Gender</span>
                      <strong className="text-slate-900 text-sm">{selectedApp.gender}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Officer</span>
                      <strong className="text-slate-900 text-sm">{selectedApp.assignedReviewer}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Scheme Details */}
              {activeDetailTab === 'scheme' && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-bold text-blue-900 text-sm mb-1">{selectedApp.schemeName}</h4>
                    <p className="text-blue-800 leading-relaxed">
                      Statutory institutional and government financial assistance scheme for students adhering to attendance and performance milestones.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Scheme ID</span>
                      <strong className="text-slate-900">{selectedApp.schemeId}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Recommended Award</span>
                      <strong className="text-slate-900">₹{selectedApp.recommendedAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Eligibility Assessment */}
              {activeDetailTab === 'eligibility' && (
                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Minimum CGPA Criteria (≥ 7.00)</span>
                        <div className="text-[11px] text-slate-500">Student attained {selectedApp.cgpa} CGPA in autonomous continuous evaluation.</div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                        Meets Requirement
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Family Income Threshold (≤ ₹2.50 Lakhs)</span>
                        <div className="text-[11px] text-slate-500">Revenue certified income: ₹{(selectedApp.annualFamilyIncome / 100000).toFixed(2)} Lakhs.</div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                        Meets Requirement
                      </span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Biometric Attendance Threshold (≥ 75%)</span>
                        <div className="text-[11px] text-slate-500">Automated campus RFID log records 87.8% verified classroom attendance.</div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-xs">
                        Meets Requirement
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Academic Records */}
              {activeDetailTab === 'academics' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-800">Autonomous Controller of Exams Ledger</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        ZERO ACTIVE BACKLOGS
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Master exam database shows candidate has passed all continuous internal evaluations (CIE) and semester end examinations (SEE).
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Financial Info */}
              {activeDetailTab === 'financial' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Family Income</span>
                      <strong className="text-slate-900 text-sm">₹{selectedApp.annualFamilyIncome.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned Annual Award</span>
                      <strong className="text-emerald-700 text-sm font-extrabold">
                        ₹{(selectedApp.finalAwardAmount || selectedApp.recommendedAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Documents */}
              {activeDetailTab === 'documents' && (
                <div className="space-y-2">
                  <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Income Certificate (Tahasildar Revenue Barcode)</span>
                      <div className="text-[11px] text-slate-400">Verified by Verification Officer · e-District repository OK</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Autonomous Examination Cell Marksheet Ledger</span>
                      <div className="text-[11px] text-slate-400">Verified by Prof. K. N. Sahoo · 8.85 CGPA</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                      Verified
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 7: Reviewer Comments */}
              {activeDetailTab === 'comments' && (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <span className="text-amber-800 font-bold block mb-1">Directorate Review Note:</span>
                    <p className="text-slate-700 italic">
                      "{selectedApp.reviewerRemarks || 'All eligibility parameters and autonomous criteria verified. Highly recommended.'}"
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 8: Committee Decisions */}
              {activeDetailTab === 'decision' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-800 block mb-1">Scholarship Standing Committee Resolution</span>
                    <p className="text-slate-600">
                      Current Approval Stage: <strong className="text-slate-800">{selectedApp.approvalStage}</strong>
                    </p>
                    <p className="text-slate-600 mt-1">
                      Assigned Reviewer: <strong className="text-slate-800">{selectedApp.assignedReviewer}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 9: Award Details */}
              {activeDetailTab === 'award' && (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-emerald-900 text-sm">Official Award Sanction</span>
                      <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        {selectedApp.disbursementStatus}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-900 mt-2">
                      ₹{(selectedApp.finalAwardAmount || selectedApp.recommendedAmount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">
                      Release schedule: 50% in Autumn Semester + 50% in Spring Semester upon attendance validation.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 10: Activity Timeline */}
              {activeDetailTab === 'timeline' && (
                <div className="space-y-3">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="font-bold text-slate-800 text-xs">Application Submitted Online</div>
                      <div className="text-[11px] text-slate-500">{selectedApp.submissionDate} · Direct student submission</div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="font-bold text-slate-800 text-xs">Income & Academic Documents Verified</div>
                      <div className="text-[11px] text-slate-500">Revenue portal digital seal confirmed zero backlogs</div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                      <div className="font-bold text-slate-800 text-xs">Executive Committee Stage</div>
                      <div className="text-[11px] text-slate-500">{selectedApp.approvalStage}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Recommended', 'Recommended for Executive Sanction')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition"
                >
                  Recommend
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Waitlisted', 'Moved to Quota Waiting List')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs transition"
                >
                  Waitlist
                </button>
                <button
                  onClick={() => setRejectionModal({ open: true, app: selectedApp, reason: '' })}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition"
                >
                  Reject with Reason
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedApp.id, 'Approved', 'Final Executive Sanction Granted')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Grant Executive Sanction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle size={18} />
              Mandatory Rejection Documentation
            </div>
            <p className="text-xs text-slate-600">
              State government and institutional welfare regulations require an explicit, auditable justification for rejecting application <strong>{rejectionModal.app?.id}</strong>.
            </p>
            <textarea
              rows="3"
              placeholder="e.g. CGPA fell below 7.00 threshold or income certificate expired..."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-rose-500"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModal({ open: false, app: null, reason: '' })}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionModal.reason.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-md shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Application Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <PlusCircle size={16} className="text-blue-600" />
                Register Student Scholarship Application
              </h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-5 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student Registration ID</label>
                  <input
                    type="text"
                    value={newAppForm.studentId}
                    onChange={(e) => setNewAppForm({ ...newAppForm, studentId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={newAppForm.studentName}
                    onChange={(e) => setNewAppForm({ ...newAppForm, studentName: e.target.value })}
                    placeholder="e.g. Subrat Mohapatra"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newAppForm.dept}
                    onChange={(e) => setNewAppForm({ ...newAppForm, dept: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Semester</label>
                  <select
                    value={newAppForm.semester}
                    onChange={(e) => setNewAppForm({ ...newAppForm, semester: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="Semester 1">Semester 1 (1st Year)</option>
                    <option value="Semester 3">Semester 3 (2nd Year)</option>
                    <option value="Semester 5">Semester 5 (3rd Year)</option>
                    <option value="Semester 7">Semester 7 (4th Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latest CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAppForm.cgpa}
                    onChange={(e) => setNewAppForm({ ...newAppForm, cgpa: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    value={newAppForm.annualFamilyIncome}
                    onChange={(e) => setNewAppForm({ ...newAppForm, annualFamilyIncome: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newAppForm.category}
                    onChange={(e) => setNewAppForm({ ...newAppForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="General">General</option>
                    <option value="General (EWS)">General (EWS)</option>
                    <option value="OBC">OBC</option>
                    <option value="SEBC">SEBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Scholarship Scheme</label>
                  <select
                    value={newAppForm.schemeId}
                    onChange={(e) => setNewAppForm({ ...newAppForm, schemeId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.awardAmount})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Type</label>
                  <select
                    value={newAppForm.applicationType}
                    onChange={(e) => setNewAppForm({ ...newAppForm, applicationType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                  >
                    <option value="New">Fresh New Application</option>
                    <option value="Renewal">Continuing Renewal Application</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Desk Intake Remarks</label>
                <textarea
                  rows="2"
                  value={newAppForm.reviewerRemarks}
                  onChange={(e) => setNewAppForm({ ...newAppForm, reviewerRemarks: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-sm"
                >
                  Register Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
