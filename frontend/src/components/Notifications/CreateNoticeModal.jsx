import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  FileText,
  Calendar,
  AlertTriangle,
  Pin,
  Clock,
  ShieldCheck,
  Users,
  CheckCircle2,
  Paperclip,
  Building,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';
import { notificationsApi } from '../../services/notificationsApi.js';

// =========================================================================
// ROLE-BASED CATEGORY & PERMISSION MATRIX
// University ERP Role Segregation:
// Faculties are strictly scoped to Academic, Departmental Events, and General Class notices.
// Financial, Transport, Hostel, Admission, Examination, and Administrative notices
// are restricted to their authorized directorates and central administration.
// =========================================================================

export const ROLE_NOTICE_PERMISSIONS = {
  faculty: {
    label: 'Academic Faculty Console',
    roleDescription: 'Scoped to syllabus, assignments, departmental seminars & class notices',
    allowedCategories: [
      { id: 'ACADEMIC', label: 'Academic (Syllabus, Coursework, Assignments & Labs)', icon: '📚' },
      { id: 'EVENTS', label: 'Events (Departmental Seminars, Workshops & Hackathons)', icon: '🎉' },
      { id: 'GENERAL', label: 'General (Classroom Updates, Extra Lectures & Reschedules)', icon: '📢' },
    ],
    defaultCategory: 'ACADEMIC',
    defaultTarget: 'TARGETED',
    allowedTargetTypes: [
      { id: 'TARGETED', label: 'Targeted Class Cohort (Program, Dept, Sem, Section)' },
      { id: 'ALL_STUDENTS', label: 'All Students in My Academic Department' },
    ],
    defaultDept: (u) => u?.department || 'Department of Computer Science & Engineering',
    defaultSender: (u) => u?.name || 'Dr. S. Mohanty (Associate Professor)',
    refPrefix: 'ACAD',
  },
  hod: {
    label: 'Department Head (HOD) Console',
    roleDescription: 'Departmental academic governance, labs, and faculty circulars',
    allowedCategories: [
      { id: 'ACADEMIC', label: 'Academic & Curriculum', icon: '📚' },
      { id: 'EVENTS', label: 'Departmental Events & Seminars', icon: '🎉' },
      { id: 'ADMINISTRATIVE', label: 'Department Administration', icon: '🏛️' },
      { id: 'GENERAL', label: 'General Department Notice', icon: '📢' },
    ],
    defaultCategory: 'ACADEMIC',
    defaultTarget: 'TARGETED',
    allowedTargetTypes: [
      { id: 'TARGETED', label: 'Targeted Academic Cohort (Dept, Sem, Section)' },
      { id: 'ALL_STUDENTS', label: 'All Students in Department' },
      { id: 'ALL_FACULTY', label: 'All Department Faculty Members' },
    ],
    defaultDept: (u) => u?.department || 'Department of Computer Science & Engineering',
    defaultSender: (u) => u?.name || 'Head of Department (HOD)',
    refPrefix: 'HOD',
  },
  exam_cell: {
    label: 'Examination Cell Console',
    roleDescription: 'Official end-semester schedules, hall tickets, and examination circulars',
    allowedCategories: [
      { id: 'EXAMINATION', label: 'Examination (End-Sem, Mid-Sem & Hall Tickets)', icon: '📝' },
      { id: 'ACADEMIC', label: 'Academic Schedules & Calendars', icon: '📚' },
      { id: 'GENERAL', label: 'General Examination Circulars', icon: '📢' },
    ],
    defaultCategory: 'EXAMINATION',
    defaultTarget: 'ALL_STUDENTS',
    allowedTargetTypes: [
      { id: 'ALL_STUDENTS', label: 'All Students (All Programs & Semesters)' },
      { id: 'TARGETED', label: 'Targeted Exam Cohort (Program, Dept, Sem)' },
      { id: 'ALL_FACULTY', label: 'All Invigilating Faculty Members' },
      { id: 'INSTITUTION', label: 'Entire Institution' },
    ],
    defaultDept: () => 'Autonomous Examination Cell',
    defaultSender: (u) => u?.name || 'Controller of Examinations (CoE)',
    refPrefix: 'EXA',
  },
  accounts: {
    label: 'Accounts & Finance Console',
    roleDescription: 'Official tuition fees, scholarship disbursals, and accounts dues notices',
    allowedCategories: [
      { id: 'ACCOUNTS', label: 'Accounts, Fees & Clearance Dues', icon: '💳' },
      { id: 'GENERAL', label: 'General Accounts Notice', icon: '📢' },
    ],
    defaultCategory: 'ACCOUNTS',
    defaultTarget: 'ALL_STUDENTS',
    allowedTargetTypes: [
      { id: 'ALL_STUDENTS', label: 'All Students (Fee Defaulters & General Invoices)' },
      { id: 'TARGETED', label: 'Targeted Semester / Batch' },
      { id: 'INSTITUTION', label: 'Entire Institution' },
    ],
    defaultDept: () => 'Accounts & Finance Department',
    defaultSender: (u) => u?.name || 'Accounts Officer (Subhashree Jena)',
    refPrefix: 'ACC',
  },
  warden: {
    label: 'Hostel & Residence Console',
    roleDescription: 'Hostel residence regulations, gate pass curfews, and mess notices',
    allowedCategories: [
      { id: 'HOSTEL', label: 'Hostel & Residence Affairs', icon: '🏠' },
      { id: 'CANTEEN', label: 'Mess & Food Services', icon: '🍽️' },
      { id: 'GENERAL', label: 'General Hostel Notice', icon: '📢' },
    ],
    defaultCategory: 'HOSTEL',
    defaultTarget: 'ALL_STUDENTS',
    allowedTargetTypes: [
      { id: 'ALL_STUDENTS', label: 'All Hostel Boarders' },
      { id: 'TARGETED', label: 'Targeted Hostel / Block' },
    ],
    defaultDept: () => 'Hostel & Residential Directorate',
    defaultSender: (u) => u?.name || 'Chief Warden / Hostel Superintendent',
    refPrefix: 'HST',
  },
  transport: {
    label: 'Transport & Fleet Console',
    roleDescription: 'Bus routes, schedule revisions, and vehicle passes',
    allowedCategories: [
      { id: 'TRANSPORT', label: 'Transport & Fleet Operations', icon: '🚌' },
      { id: 'GENERAL', label: 'General Transport Notice', icon: '📢' },
    ],
    defaultCategory: 'TRANSPORT',
    defaultTarget: 'INSTITUTION',
    allowedTargetTypes: [
      { id: 'INSTITUTION', label: 'All Commuters & College Community' },
      { id: 'ALL_STUDENTS', label: 'All Student Commuters' },
      { id: 'ALL_FACULTY', label: 'All Faculty & Staff Commuters' },
    ],
    defaultDept: () => 'Transport & Fleet Management Cell',
    defaultSender: (u) => u?.name || 'Transport In-Charge',
    refPrefix: 'TRN',
  },
  placement: {
    label: 'Training & Placement Console',
    roleDescription: 'Recruitment drives, company shortlists, and interview schedules',
    allowedCategories: [
      { id: 'PLACEMENT', label: 'Placement Drives & Recruitment', icon: '💼' },
      { id: 'EVENTS', label: 'Career Seminars & Workshops', icon: '🎉' },
      { id: 'GENERAL', label: 'General Placement Circular', icon: '📢' },
    ],
    defaultCategory: 'PLACEMENT',
    defaultTarget: 'ALL_STUDENTS',
    allowedTargetTypes: [
      { id: 'ALL_STUDENTS', label: 'All Graduating Batches' },
      { id: 'TARGETED', label: 'Targeted Eligible Branches / Semesters' },
    ],
    defaultDept: () => 'Directorate of Training & Placement',
    defaultSender: (u) => u?.name || 'Training & Placement Officer (TPO)',
    refPrefix: 'TPO',
  },
  admissions: {
    label: 'Admissions Office Console',
    roleDescription: 'Intake counseling, seat matrix, and admission policies',
    allowedCategories: [
      { id: 'ADMISSION', label: 'Admissions & Counseling', icon: '🎓' },
      { id: 'GENERAL', label: 'General Admissions Notice', icon: '📢' },
    ],
    defaultCategory: 'ADMISSION',
    defaultTarget: 'INSTITUTION',
    allowedTargetTypes: [
      { id: 'INSTITUTION', label: 'Entire Institution' },
      { id: 'ALL_STUDENTS', label: 'All Enrolled Students' },
    ],
    defaultDept: () => 'Admissions & Student Intake Office',
    defaultSender: (u) => u?.name || 'Senior Admissions Officer',
    refPrefix: 'ADM',
  },
  library: {
    label: 'Library Directorate Console',
    roleDescription: 'Library circulation, digital catalogue, and reading room timings',
    allowedCategories: [
      { id: 'LIBRARY', label: 'Library & Learning Resources', icon: '📖' },
      { id: 'GENERAL', label: 'General Library Notice', icon: '📢' },
    ],
    defaultCategory: 'LIBRARY',
    defaultTarget: 'INSTITUTION',
    allowedTargetTypes: [
      { id: 'INSTITUTION', label: 'Entire Institution' },
      { id: 'ALL_STUDENTS', label: 'All Students' },
      { id: 'ALL_FACULTY', label: 'All Faculty Members' },
    ],
    defaultDept: () => 'Central University Library',
    defaultSender: (u) => u?.name || 'Chief Librarian',
    refPrefix: 'LIB',
  },
  principal: {
    label: 'Principal & Director Executive Console',
    roleDescription: 'Full institutional authority across all academic and administrative domains',
    allowedCategories: [
      { id: 'ADMINISTRATIVE', label: 'Administrative & Governance', icon: '🏛️' },
      { id: 'ACADEMIC', label: 'Academic & Curriculum Policy', icon: '📚' },
      { id: 'EXAMINATION', label: 'Examination & University Affairs', icon: '📝' },
      { id: 'EVENTS', label: 'Institutional Events & Celebrations', icon: '🎉' },
      { id: 'ACCOUNTS', label: 'Accounts & Finance Policy', icon: '💳' },
      { id: 'ADMISSION', label: 'Admissions & Intake Policy', icon: '🎓' },
      { id: 'PLACEMENT', label: 'Placement & Career Development', icon: '💼' },
      { id: 'LIBRARY', label: 'Library Directorate', icon: '📖' },
      { id: 'HOSTEL', label: 'Hostel Affairs', icon: '🏠' },
      { id: 'TRANSPORT', label: 'Transport Services', icon: '🚌' },
      { id: 'CANTEEN', label: 'Canteen & Hospitality', icon: '🍽️' },
      { id: 'GENERAL', label: 'General University Circular', icon: '📢' },
    ],
    defaultCategory: 'ADMINISTRATIVE',
    defaultTarget: 'INSTITUTION',
    allowedTargetTypes: [
      { id: 'INSTITUTION', label: 'Entire Institution (All Students, Faculty & Staff)' },
      { id: 'ALL_STUDENTS', label: 'All Students (All Programs & Semesters)' },
      { id: 'ALL_FACULTY', label: 'All Academic Faculty Members' },
      { id: 'ALL_STAFF', label: 'All Administrative & Support Staff' },
      { id: 'TARGETED', label: 'Targeted Academic Cohort' },
    ],
    defaultDept: () => 'Office of the Principal & Director',
    defaultSender: (u) => u?.name || 'Principal & Director',
    refPrefix: 'DIR',
  },
  admin: {
    label: 'Central Administrator Console',
    roleDescription: 'Full administrative broadcast and institutional governance',
    allowedCategories: [
      { id: 'ADMINISTRATIVE', label: 'Administrative & Governance', icon: '🏛️' },
      { id: 'ACADEMIC', label: 'Academic & Curriculum Policy', icon: '📚' },
      { id: 'EXAMINATION', label: 'Examination & University Affairs', icon: '📝' },
      { id: 'EVENTS', label: 'Institutional Events & Celebrations', icon: '🎉' },
      { id: 'ACCOUNTS', label: 'Accounts & Finance Policy', icon: '💳' },
      { id: 'ADMISSION', label: 'Admissions & Intake Policy', icon: '🎓' },
      { id: 'PLACEMENT', label: 'Placement & Career Development', icon: '💼' },
      { id: 'LIBRARY', label: 'Library Directorate', icon: '📖' },
      { id: 'HOSTEL', label: 'Hostel Affairs', icon: '🏠' },
      { id: 'TRANSPORT', label: 'Transport Services', icon: '🚌' },
      { id: 'CANTEEN', label: 'Canteen & Hospitality', icon: '🍽️' },
      { id: 'GENERAL', label: 'General University Circular', icon: '📢' },
    ],
    defaultCategory: 'ADMINISTRATIVE',
    defaultTarget: 'INSTITUTION',
    allowedTargetTypes: [
      { id: 'INSTITUTION', label: 'Entire Institution (All Students, Faculty & Staff)' },
      { id: 'ALL_STUDENTS', label: 'All Students (All Programs & Semesters)' },
      { id: 'ALL_FACULTY', label: 'All Academic Faculty Members' },
      { id: 'ALL_STAFF', label: 'All Administrative & Support Staff' },
      { id: 'TARGETED', label: 'Targeted Academic Cohort' },
    ],
    defaultDept: () => 'Central Administrative Directorate',
    defaultSender: (u) => u?.name || 'Registrar / Central Administrator',
    refPrefix: 'ADM',
  },
};

const PRIORITIES = [
  { id: 'URGENT', label: '🔴 Urgent (Emergency & Critical Deadlines)', color: '#dc2626' },
  { id: 'IMPORTANT', label: '🟡 Important (Schedules & Key Instructions)', color: '#d97706' },
  { id: 'NORMAL', label: '🔵 General (Regular Announcements & Updates)', color: '#2563eb' },
];

export default function CreateNoticeModal({
  isOpen,
  onClose,
  currentUser,
  onNoticeCreated,
}) {
  // Determine role config
  const roleKey = String(currentUser?.role || 'faculty').toLowerCase();
  const roleConfig = ROLE_NOTICE_PERMISSIONS[roleKey] || ROLE_NOTICE_PERMISSIONS.faculty;
  const isFaculty = roleKey === 'faculty';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [category, setCategory] = useState(roleConfig.defaultCategory);
  const [priority, setPriority] = useState('IMPORTANT');
  const [senderDept, setSenderDept] = useState(roleConfig.defaultDept(currentUser));
  const [senderName, setSenderName] = useState(roleConfig.defaultSender(currentUser));

  // Audience targeting
  const [targetType, setTargetType] = useState(roleConfig.defaultTarget);
  const [targetProgram, setTargetProgram] = useState('B.Tech');
  const [targetDepartment, setTargetDepartment] = useState(currentUser?.department || 'Computer Science & Engineering');
  const [targetSemester, setTargetSemester] = useState('Semester 5');
  const [targetSection, setTargetSection] = useState('ALL_ASSIGNED');
  const [estimatedReach, setEstimatedReach] = useState(128);

  // Controls
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [expiryDays, setExpiryDays] = useState(30);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [channels, setChannels] = useState({
    portal: true,
    email: true,
    sms: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Re-initialize whenever modal opens or active role changes
  useEffect(() => {
    if (isOpen) {
      const activeRoleKey = String(currentUser?.role || 'faculty').toLowerCase();
      const cfg = ROLE_NOTICE_PERMISSIONS[activeRoleKey] || ROLE_NOTICE_PERMISSIONS.faculty;

      setCategory(cfg.defaultCategory);
      setPriority('IMPORTANT');
      setSenderDept(cfg.defaultDept(currentUser));
      setSenderName(cfg.defaultSender(currentUser));
      setTargetType(cfg.defaultTarget);
      if (currentUser?.department) {
        setTargetDepartment(currentUser.department);
      }
      setErrorMsg('');

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const catCode = cfg.defaultCategory.slice(0, 3).toUpperCase();
      setReferenceNumber(`CIR/${cfg.refPrefix || catCode}/2026/${randomNum}`);
    }
  }, [isOpen, currentUser]);

  // Auto-generate reference number on category change
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const catCode = category.slice(0, 3).toUpperCase();
    const prefix = roleConfig.refPrefix || catCode;
    setReferenceNumber(`CIR/${prefix}/2026/${randomNum}`);
  }, [category, roleConfig]);

  // Recalculate estimated reach whenever audience target changes
  useEffect(() => {
    async function updateEstimate() {
      try {
        const res = await notificationsApi.estimateRecipients({
          targetType,
          program: targetProgram,
          department: targetDepartment,
          semester: targetSemester,
          section: targetSection,
        });
        if (res?.count) {
          setEstimatedReach(res.count);
          return;
        }
      } catch (e) {
        // Fallback calculation
      }

      if (targetType === 'INSTITUTION') setEstimatedReach(2666);
      else if (targetType === 'ALL_STUDENTS') setEstimatedReach(isFaculty ? 240 : 2480);
      else if (targetType === 'ALL_FACULTY') setEstimatedReach(146);
      else if (targetType === 'ALL_STAFF') setEstimatedReach(65);
      else {
        if (targetSection === 'ALL_ASSIGNED') {
          setEstimatedReach(128); // 4 sections * 32
        } else {
          setEstimatedReach(32);
        }
      }
    }

    updateEstimate();
  }, [targetType, targetProgram, targetDepartment, targetSemester, targetSection, isFaculty]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide both notice title and description.');
      return;
    }

    // Role-based validation guard
    const allowedCatIds = roleConfig.allowedCategories.map((c) => c.id);
    if (!allowedCatIds.includes(category)) {
      setErrorMsg(`As a ${roleKey.toUpperCase()}, you are not authorized to publish under category '${category}'. Permitted categories: ${allowedCatIds.join(', ')}.`);
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    const payload = {
      title: title.trim(),
      message: description.trim(),
      description: description.trim(),
      category,
      priority,
      referenceNumber: referenceNumber.trim(),
      senderName,
      senderDept,
      senderRole: currentUser?.role || 'faculty',
      targetType,
      targetRules: {
        targetType,
        program: targetProgram,
        department: targetDepartment,
        semester: targetSemester,
        section: targetSection,
      },
      requiresAcknowledgement,
      isPinned,
      expiryDays,
      expiresAt: expiresAt.toISOString(),
      attachmentName: attachmentName.trim() || null,
      attachmentUrl: attachmentUrl.trim() || null,
      deliveredCount: estimatedReach,
      channels: Object.keys(channels).filter((k) => channels[k]),
    };

    try {
      await notificationsApi.publishNotice(payload);
      if (onNoticeCreated) onNoticeCreated(payload);
      onClose();
    } catch (err) {
      // Gracefully persist to local store and notify
      if (onNoticeCreated) onNoticeCreated(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isFaculty ? '#2563eb' : '#6366f1',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {roleConfig.label}
                </h3>
                {isFaculty && (
                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    Role: Faculty
                  </span>
                )}
              </div>
              <small style={{ color: '#64748b' }}>
                {roleConfig.roleDescription}
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#b91c1c',
                  fontSize: '0.84rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} /> {errorMsg}
              </div>
            )}

            {isFaculty && (
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '0.8rem',
                  color: '#1e40af',
                }}
              >
                <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong>Role Scoping Notice:</strong> As an Academic Faculty member, your publishing privileges are restricted to <strong>Academic &amp; Coursework</strong>, <strong>Departmental Events</strong>, and <strong>General Class Notices</strong>. Administrative categories such as Examination, Accounts/Fees, Hostel, and Transport are reserved for their respective administrative cells.
                </div>
              </div>
            )}

            {/* Basic Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  CATEGORY *
                </label>
                <select
                  className="admin-form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  {roleConfig.allowedCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon ? `${c.icon} ` : ''}{c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  PRIORITY LEVEL *
                </label>
                <select
                  className="admin-form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Reference No */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  NOTICE TITLE *
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder={
                    isFaculty
                      ? 'e.g. Design & Analysis of Algorithms — Assignment 2 Submission & Lab Practical'
                      : 'e.g. Official Institutional Circular'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  CIRCULAR / REF NO.
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Sender Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  ISSUING AUTHORITY NAME *
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  DEPARTMENT / CELL *
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={senderDept}
                  onChange={(e) => setSenderDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>

            {/* AUDIENCE TARGETING ENGINE */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="#6366f1" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
                    AUDIENCE TARGETING ENGINE
                  </span>
                </div>
                <div
                  style={{
                    background: '#e0e7ff',
                    color: '#4338ca',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                  }}
                >
                  Estimated Reach: {estimatedReach.toLocaleString()} recipients
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  TARGET AUDIENCE GROUP
                </label>
                <select
                  className="admin-form-select"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.82rem' }}
                >
                  {roleConfig.allowedTargetTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {targetType === 'TARGETED' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  <div>
                    <small style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>PROGRAM</small>
                    <select
                      className="admin-form-select"
                      value={targetProgram}
                      onChange={(e) => setTargetProgram(e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="B.Tech">B.Tech</option>
                      <option value="MCA">MCA</option>
                      <option value="MBA">MBA</option>
                      <option value="M.Tech">M.Tech</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>DEPARTMENT</small>
                    <select
                      className="admin-form-select"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                      <option value="Electronics & Communication Engineering">Electronics &amp; Communication</option>
                      <option value="Electrical & Electronics Engineering">Electrical &amp; Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SEMESTER</small>
                    <select
                      className="admin-form-select"
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="Semester 1">Semester 1</option>
                      <option value="Semester 2">Semester 2</option>
                      <option value="Semester 3">Semester 3</option>
                      <option value="Semester 4">Semester 4</option>
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>

                  <div>
                    <small style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>SECTION</small>
                    <select
                      className="admin-form-select"
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                      style={{ width: '100%', padding: '4px 8px', fontSize: '0.78rem' }}
                    >
                      <option value="ALL_ASSIGNED">All Assigned Sections</option>
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Message Description */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                CIRCULAR MESSAGE &amp; INSTRUCTIONS *
              </label>
              <textarea
                className="admin-form-textarea"
                rows={5}
                placeholder={
                  isFaculty
                    ? 'Enter detailed class instructions, syllabus topics to prepare, assignment questions, or lab practical requirements...'
                    : 'Enter the full institutional announcement details, timings, protocols, and instructions...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '0.88rem', minHeight: '110px' }}
                required
              />
            </div>

            {/* Attachment */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                ATTACH SUPPORTING DOCUMENT (PDF / DOCUMENT URL)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Assignment_Questions.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                />
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="https://storage.apnacampus.edu.in/docs/... or internal link"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Controls Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requiresAcknowledgement}
                  onChange={(e) => setRequiresAcknowledgement(e.target.checked)}
                />
                <span>Mandatory Read Acknowledgment</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <span>Pin to Top of Notice Board</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: '#475569' }}>Active Duration:</span>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
                >
                  <option value={7}>7 Days</option>
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isFaculty ? '#2563eb' : '#6366f1',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Send size={15} />
                <span>{submitting ? 'Publishing...' : 'Publish Notice Now'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
