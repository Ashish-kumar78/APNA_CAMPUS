import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Edit2,
  Users,
  Home,
  Settings,
  FileCheck2,
  Heart,
  CheckCircle2,
  Info,
  Download,
  Eye,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Shield
} from 'lucide-react';
import './hostel/WardenEmployeeProfile.css';
import { downloadWardenDocument, getWardenDocumentPreviewUrl } from '../utils/wardenDocumentService.js';

const DEFAULT_SECURITY_DOCUMENTS = [
  {
    id: 'doc-sec-1',
    name: 'Security Guard Appointment Order & Joining Record',
    meta: 'Issued 15-08-2018 · Autonomous Secretariat · Ref: BPUT/AUT/HR/SEC-4421/01',
  },
  {
    id: 'doc-sec-2',
    name: 'PSARA State Security Guard Grade-I License Card',
    meta: 'Grade A+ Certified · PSARA ID: PSARA-OD-2024-9982 · Valid 2024–2029',
  },
  {
    id: 'doc-sec-3',
    name: 'Police Character Clearance & Background Verification Record',
    meta: 'Chandaka Police Station · Clear Verification · Certified 2024',
  },
  {
    id: 'doc-sec-4',
    name: 'St. John Red Cross Emergency First Aid & CPR Certificate',
    meta: 'Certified Campus Medical First Responder · Grade A+ (Valid 2024–2027)',
  },
  {
    id: 'doc-sec-5',
    name: 'State Fire Service Disaster Management & Hose Reel Drill Diploma',
    meta: 'Odisha Fire & Emergency Services Training Academy · Certified Hose Reel Marshal',
  },
  {
    id: 'doc-sec-6',
    name: 'Annual Security Personnel Physical Fitness & Medical Clearance',
    meta: 'Campus Health Center Medical Board · Fit for Active 24x7 Security Operations',
  },
];

export function deriveSecurityPersonFromAccount(account) {
  const defaultPerson = {
    employeeId: 'SG-OD-4421',
    bputRegdNo: 'PSARA-OD-2024-4421',
    name: 'Mr. Dillip Kumar Pradhan',
    title: 'Mr.',
    firstName: 'Dillip',
    middleName: 'Kumar',
    lastName: 'Pradhan',
    nameAlias: 'D. K. Pradhan',
    designation: 'Senior Security Guard & Post Marshal',
    department: 'Campus Security & Access Control',
    category: 'Security & Vigilance / Non-Teaching',
    joiningDate: '15-08-2018',
    empDob: '12-05-1984',
    gender: 'MALE',
    birthPlace: 'Ranpur, Nayagarh, Odisha',
    totalExperience: '12 Year(s) 4 Month(s)',
    bloodGroup: 'B+',
    maritalStatus: 'MARRIED',
    caste: 'General',
    nationality: 'Indian',
    religion: 'Hindu',
    thumb: 'SEC-8841',
    lunch: 'Y',
    transport: 'Y',
    breakfast: 'Y',
    dinner: 'Y',
    uniformAllowance: 'Y',
    nightAllowance: 'Y',
    rationAllowance: 'Y',
    hazardAllowance: 'Y',
    mobileNo: '+91 98610 44210',
    emailId: 'dillip.pradhan@apnacampus.edu.in',
    status: 'Active',
    avatar: '/passport_photo_male.svg',
    // Guardians
    fatherName: 'Late Ananta Charan Pradhan',
    motherName: 'Mrs. Radhamani Pradhan',
    spouseName: 'Mrs. Sunita Pradhan',
    emergencyContact: 'Mrs. Sunita Pradhan',
    guardianMobile: '+91 94371 88412',
    relationship: 'Spouse',
    guardianOccupation: 'Homemaker & Campus Staff Welfare Committee Member',
    // Address
    presentAddress1: 'Staff Quarters Block D-204',
    presentAddress2: 'Campus Security & Housing Enclave, Chandaka',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentState: 'Odisha',
    presentPin: '751024',
    presentPS: 'Chandaka PS',
    permAddress1: 'At/PO - Chandpur, Block - Ranpur',
    permDistrict: 'Nayagarh',
    permState: 'Odisha',
    permPin: '752024',
    permPS: 'Chandpur PS',
    // Other Info
    attendanceCardId: 'SEC-GATE-01',
    otherBputRegdNo: 'PSARA-OD-2024-9982',
    aadhaarNo: '748190243318',
    panNo: 'BLAPP8914M',
    voterId: 'OD/02/104/552194',
    drivingLicenseNo: 'OD-0220060044192',
    bankAccountNo: '34810294812',
    bankName: 'State Bank of India (SBI Info City)',
    ifscCode: 'SBIN0010234',
    motherNameOther: 'Radhamani Pradhan',
    reference: 'Office of Campus Chief Proctor & Security Officer',
    qualification: 'Higher Secondary (+2 Arts) · CHSE Odisha',
    specialization: 'Perimeter Access Control, Optical Turnstiles & Emergency Response',
    papersPublished: 'Campus Perimeter Vigilance & Optical Speed Gate SOP Guidelines (2024)',
    booksWritten: 'Institutional Security Marshal Handbook & First Response Manual',
    rdProjectUndertaken: 'Optical Turnstile Biometric Rapid Validation Pilot (2025)',
    membershipProfessionalSociety: 'Life Member, All India Security Guard & Marshals Welfare Association',
    workshopsAttended: 'State Police & Fire Services Disaster Evacuation Drill (2025)',
    nationalConferencesAttended: 'Annual Campus Security, Safety & Vigilance Summit (2024)',
    internationalConferencesAttended: 'South Asian Physical Security & Surveillance Summit (2023)',
    languages: 'Odia, Hindi, English',
    hobbies: 'Physical Fitness, Kabaddi, Community Emergency Relief',
    // Health
    fitnessStatus: 'Grade A+ · Fit for Active 24x7 Post Duty & Perimeter Patrol',
    height: '178 cm',
    weight: '74 kg',
    insuranceScheme: 'Institutional Staff Group Mediclaim & Accidental Cover',
    policyNumber: 'EMP-SEC-HLTH-2026-4421',
    emergencyHospital: 'Campus Health & Trauma Center / SUM Hospital (Networked)',
    allergies: 'None Reported · Clinically Certified Fit with 6/6 Uncorrected Vision',
    // Operational Scope
    postName: 'Main Campus Gate 1 (Front Entrance)',
    shiftInfo: 'Morning Shift (06:00 - 14:00) · Active',
    turnstilesInfo: '4 Lane Optical Speed Gates & Boom Barriers',
    vigilanceInfo: 'Grade A+ (100% Perimeter Security)',
  };

  if (!account) return defaultPerson;

  // Extract ID / Badge
  const extractedId =
    account.identity ||
    (account.detail?.includes('Badge')
      ? account.detail.split('Badge')[1]?.trim()?.replace(')', '')
      : null) ||
    'SG-OD-4421';

  // Parse name dynamically according to the person
  const rawName = account.name || defaultPerson.name;
  const parts = rawName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').trim().split(/\s+/);
  const firstName = parts[0] || 'Dillip';
  const lastName = parts.length > 1 ? parts[parts.length - 1] : 'Pradhan';
  const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : (parts.length === 2 ? '' : 'Kumar');
  const title = rawName.startsWith('Mrs.')
    ? 'Mrs.'
    : rawName.startsWith('Ms.')
    ? 'Ms.'
    : rawName.startsWith('Dr.')
    ? 'Dr.'
    : 'Mr.';
  const nameAlias = `${firstName[0]}. ${middleName ? middleName[0] + '. ' : ''}${lastName}`;
  const numericSuffix = extractedId.replace(/[^0-9]/g, '') || '4421';

  return {
    ...defaultPerson,
    employeeId: extractedId,
    bputRegdNo: `PSARA-OD-2024-${numericSuffix}`,
    otherBputRegdNo: `PSARA-OD-2024-${numericSuffix}`,
    attendanceCardId: `SEC-GATE-${numericSuffix.slice(-2)}`,
    name:
      rawName.startsWith('Mr.') || rawName.startsWith('Mrs.') || rawName.startsWith('Ms.')
        ? rawName
        : `${title} ${rawName}`,
    title,
    firstName,
    middleName,
    lastName,
    nameAlias,
    mobileNo: account.phone || defaultPerson.mobileNo,
    emailId: account.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@apnacampus.edu.in`,
    designation:
      account.designation ||
      (account.role === 'security'
        ? 'Senior Security Guard & Post Marshal'
        : defaultPerson.designation),
    department: account.department || defaultPerson.department,
    postName: account.detail?.includes('·')
      ? account.detail.split('·')[0]?.trim()
      : defaultPerson.postName,
  };
}

export default function SecurityGuardEmployeeProfile({ account, onBack }) {
  // Tabs matching Images 1 to 5: 'personal', 'guardians', 'address', 'other_info', 'documents', 'health'
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const photoInputRef = useRef(null);

  const effectiveId =
    account?.identity ||
    (account?.detail?.includes('Badge')
      ? account.detail.split('Badge')[1]?.trim()?.replace(')', '')
      : null) ||
    'SG-OD-4421';

  // Dynamic Profile Data loaded and saved per individual person
  const [profileData, setProfileData] = useState(() => {
    const derived = deriveSecurityPersonFromAccount(account);
    try {
      const saved = localStorage.getItem(`security_guard_profile_${effectiveId}`);
      const savedAvatar =
        localStorage.getItem(`security_guard_avatar_${effectiveId}`) ||
        localStorage.getItem('security_guard_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedAvatar) parsed.avatar = savedAvatar;
        return { ...derived, ...parsed };
      }
      if (savedAvatar) {
        return { ...derived, avatar: savedAvatar };
      }
    } catch (e) {
      console.warn('Failed reading saved security guard profile:', e);
    }
    return derived;
  });

  // Re-sync whenever logged in person changes
  useEffect(() => {
    const derived = deriveSecurityPersonFromAccount(account);
    try {
      const saved = localStorage.getItem(`security_guard_profile_${effectiveId}`);
      const savedAvatar =
        localStorage.getItem(`security_guard_avatar_${effectiveId}`) ||
        localStorage.getItem('security_guard_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedAvatar) parsed.avatar = savedAvatar;
        setProfileData({ ...derived, ...parsed });
        return;
      }
      if (savedAvatar) {
        setProfileData({ ...derived, avatar: savedAvatar });
        return;
      }
    } catch {}
    setProfileData(derived);
  }, [account, effectiveId]);

  // Documents array stored per individual security guard
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(`security_guard_docs_${effectiveId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SECURITY_DOCUMENTS;
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  // Document Upload Form
  const [newDocForm, setNewDocForm] = useState({
    name: '',
    meta: '',
    fileData: null,
    fileName: '',
    fileType: '',
    fileSize: null,
    fileSizeFormatted: '',
  });
  const fileInputRef = useRef(null);

  // Document viewer modal state
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync avatar updates across terminals
  useEffect(() => {
    const handleAvatarSync = () => {
      const updated =
        localStorage.getItem(`security_guard_avatar_${effectiveId}`) ||
        localStorage.getItem('security_guard_avatar');
      if (updated) {
        setProfileData((prev) => ({ ...prev, avatar: updated }));
      }
    };
    window.addEventListener('security_guard_avatar_changed', handleAvatarSync);
    return () => window.removeEventListener('security_guard_avatar_changed', handleAvatarSync);
  }, [effectiveId]);

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setProfileData((prev) => {
          const updated = { ...prev, avatar: dataUrl };
          try {
            localStorage.setItem(`security_guard_profile_${effectiveId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
        try {
          localStorage.setItem(`security_guard_avatar_${effectiveId}`, dataUrl);
          localStorage.setItem('security_guard_avatar', dataUrl);
          window.dispatchEvent(new Event('security_guard_avatar_changed'));
        } catch {}
        showToast('Guard photo updated and synchronized across gate terminals.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (sectionKey) => {
    setEditForm({ ...profileData });
    setEditingSection(sectionKey || activeTab);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updated = { ...editForm };
    setProfileData(updated);
    try {
      localStorage.setItem(`security_guard_profile_${effectiveId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event('security_guard_profile_updated'));
    } catch {}
    setEditingSection(null);
    showToast(`Successfully updated ${getSectionTitle(editingSection)}.`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please choose a smaller file.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const autoTitle = cleanFileName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      setNewDocForm((prev) => ({
        ...prev,
        name: prev.name.trim() ? prev.name : autoTitle,
        meta:
          prev.meta.trim()
            ? prev.meta
            : `Official Upload · ${file.name} (${sizeFormatted}) · Verified ${new Date().toLocaleDateString('en-GB')}`,
        fileData: base64Data,
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        fileSizeFormatted: sizeFormatted,
      }));
      showToast(`Selected file: ${file.name} (${sizeFormatted})`);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocumentSubmit = (e) => {
    e.preventDefault();
    if (!newDocForm.name.trim()) {
      showToast('Please provide a document title.');
      return;
    }

    const newDoc = {
      id: `doc-sec-${Date.now()}`,
      name: newDocForm.name.trim(),
      meta:
        newDocForm.meta.trim() ||
        `Verified Gate Upload · ${new Date().toLocaleDateString('en-GB')}`,
      fileData: newDocForm.fileData || null,
      fileName: newDocForm.fileName || null,
      fileType: newDocForm.fileType || (newDocForm.fileData ? 'application/pdf' : null),
      fileSize: newDocForm.fileSize || null,
      uploadedAt: new Date().toISOString(),
      uploadedBy: profileData.name || 'Security Personnel',
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    try {
      localStorage.setItem(`security_guard_docs_${effectiveId}`, JSON.stringify(updatedDocs));
    } catch {}

    setNewDocForm({
      name: '',
      meta: '',
      fileData: null,
      fileName: '',
      fileType: '',
      fileSize: null,
      fileSizeFormatted: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingSection(null);
    showToast('Verification credential uploaded and attached to guard dossier.');
  };

  const handleDeleteDocument = (id) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    try {
      localStorage.setItem(`security_guard_docs_${effectiveId}`, JSON.stringify(updated));
    } catch {}
    showToast('Document record removed.');
  };

  const handleViewDocument = (doc) => {
    setSelectedDocForView(doc);
    const preview = getWardenDocumentPreviewUrl(doc, profileData);
    setDocViewerUrl(preview);
    setIsDocViewerOpen(true);
  };

  const handleDownloadPdf = (doc) => {
    downloadWardenDocument(doc, profileData);
    showToast(`Downloading official PDF: ${doc.name}`);
  };

  const handleGeneratePdf = () => {
    window.print();
  };

  const getSectionTitle = (sec) => {
    switch (sec) {
      case 'personal':
        return 'Personal Details';
      case 'guardians':
        return 'Family & Guardians';
      case 'address':
        return 'Addresses';
      case 'other_info':
        return 'Other Info';
      case 'health':
        return 'Health Records';
      case 'summary':
        return 'Official Summary';
      case 'documents':
        return 'Document Records';
      default:
        return 'Personnel Details';
    }
  };

  return (
    <div className="emp-profile-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '20px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Top Header Bar Matching Images 1 to 5 */}
      <div className="emp-profile-header-bar">
        <div className="emp-profile-title-left">
          {onBack && (
            <button
              type="button"
              className="emp-back-btn"
              onClick={onBack}
              title="Return to Dashboard"
            >
              <ArrowLeft size={15} />
              <span>← Dashboard</span>
            </button>
          )}
          <div>
            <h2 className="emp-profile-heading">
              Security Guard Official CMS Profile: {profileData.name}
            </h2>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '2px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600 }}>Active Role Perspective:</span>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                {profileData.designation}
              </span>
              <span>· Employee ID: {profileData.employeeId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="emp-edit-btn"
            onClick={() => openEditModal(activeTab)}
            title="Edit this section"
            style={{ padding: '0.45rem 1rem' }}
          >
            <Edit2 size={14} />
            <span>Edit {getSectionTitle(activeTab)}</span>
          </button>
          <button
            type="button"
            className="emp-generate-pdf-btn"
            onClick={handleGeneratePdf}
            title="Print or Generate Guard PDF Dossier"
          >
            <FileText size={15} />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid Matching Images 1 to 5 */}
      <div className="emp-profile-grid">
        {/* LEFT COLUMN: Summary Card (Image 1 style) */}
        <aside className="emp-summary-card">
          <div className="emp-photo-container">
            <div
              className="emp-photo-ring"
              title="Guard Profile Photo (Click edit icon to change)"
            >
              <img
                src={profileData.avatar || '/passport_photo_male.svg'}
                alt={profileData.name}
                className="emp-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/passport_photo_male.svg';
                }}
              />
              <button
                type="button"
                className="emp-photo-edit-badge"
                title="Change & Sync Guard Photo"
                onClick={() => photoInputRef.current && photoInputRef.current.click()}
              >
                <Edit2 size={14} />
              </button>
            </div>
          </div>

          <table className="emp-summary-table">
            <tbody>
              <tr>
                <td className="emp-summary-label">Employee ID</td>
                <td className="emp-summary-val">{profileData.employeeId}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">PSARA / Regd No.</td>
                <td className="emp-summary-val">{profileData.bputRegdNo}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Name</td>
                <td className="emp-summary-val">{profileData.name}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Designation</td>
                <td className="emp-summary-val">{profileData.designation}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Department</td>
                <td className="emp-summary-val">{profileData.department}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Date of Joining</td>
                <td className="emp-summary-val">{profileData.joiningDate}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Mobile Number</td>
                <td className="emp-summary-val">{profileData.mobileNo}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Official Email</td>
                <td className="emp-summary-val" style={{ wordBreak: 'break-all' }}>
                  {profileData.emailId}
                </td>
              </tr>
              <tr>
                <td className="emp-summary-label">Status</td>
                <td className="emp-summary-val">
                  <span className="emp-status-badge active">{profileData.status}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Operational Scope Overview */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <h4
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.85rem',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} /> Main Gate 1 Perimeter &amp; Turnstiles
            </h4>
            <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.45' }}>
              <div>
                <strong>Duty Post:</strong> {profileData.postName}
              </div>
              <div style={{ marginTop: '3px' }}>
                <strong>Optical Speed Gates:</strong> {profileData.turnstilesInfo}
              </div>
              <div style={{ marginTop: '3px' }}>
                <strong>Active Vigilance:</strong> {profileData.vigilanceInfo}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="emp-edit-btn"
              onClick={() => openEditModal('summary')}
              style={{ width: '100%', justifyContent: 'center', background: '#0369a1' }}
            >
              <Edit2 size={13} />
              <span>Edit Official Summary</span>
            </button>
          </div>
        </aside>

        {/* Hidden File Input for Avatar Photo */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handlePhotoUpload}
        />

        {/* RIGHT COLUMN: Tabbed Details (Exact match to Images 1 to 5) */}
        <div className="emp-tabs-section">
          <div className="emp-tabs-nav" role="tablist">
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <span>⚓</span>
              <span>Personal</span>
            </button>
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'guardians' ? 'active' : ''}`}
              onClick={() => setActiveTab('guardians')}
            >
              <Users size={15} />
              <span>Guardians</span>
            </button>
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <Home size={15} />
              <span>Address</span>
            </button>
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'other_info' ? 'active' : ''}`}
              onClick={() => setActiveTab('other_info')}
            >
              <Settings size={15} />
              <span>Other Info</span>
            </button>
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FileCheck2 size={15} />
              <span>Documents ({documents.length})</span>
            </button>
            <button
              type="button"
              className={`emp-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              <Heart size={15} />
              <span>Health</span>
            </button>
          </div>

          <div className="emp-tab-panel">
            {/* TAB 1: PERSONAL DETAILS (Matching Image 1) */}
            {activeTab === 'personal' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Info size={18} color="#0284c7" />
                    <span>Personal Details</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('personal')}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="emp-details-grid">
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Title</span>
                    <span className="emp-detail-value">{profileData.title}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">First Name</span>
                    <span className="emp-detail-value">{profileData.firstName}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Last Name</span>
                    <span className="emp-detail-value">{profileData.lastName}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Middle Name</span>
                    <span className="emp-detail-value">{profileData.middleName || '—'}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Name Alias</span>
                    <span className="emp-detail-value">{profileData.nameAlias}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Joining Date</span>
                    <span className="emp-detail-value">{profileData.joiningDate}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Emp Date of Birth</span>
                    <span className="emp-detail-value">{profileData.empDob}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Gender</span>
                    <span className="emp-detail-value">{profileData.gender}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Birth Place</span>
                    <span className="emp-detail-value">{profileData.birthPlace}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Department</span>
                    <span className="emp-detail-value">{profileData.department}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Designation</span>
                    <span className="emp-detail-value">{profileData.designation}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Category</span>
                    <span className="emp-detail-value">{profileData.category}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Total Experience</span>
                    <span className="emp-detail-value">{profileData.totalExperience}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Blood Group</span>
                    <span className="emp-detail-value">{profileData.bloodGroup}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Marital Status</span>
                    <span className="emp-detail-value">{profileData.maritalStatus}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Caste</span>
                    <span className="emp-detail-value">{profileData.caste}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Nationality</span>
                    <span className="emp-detail-value">{profileData.nationality}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Religion</span>
                    <span className="emp-detail-value">{profileData.religion}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Biometric Thumb ID</span>
                    <span className="emp-detail-value">{profileData.thumb}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Uniform Allowance</span>
                    <span className="emp-detail-value">
                      {profileData.uniformAllowance === 'Y' || profileData.lunch === 'Y'
                        ? 'YES'
                        : 'NO'}
                    </span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Night Shift Allowance</span>
                    <span className="emp-detail-value">
                      {profileData.nightAllowance === 'Y' || profileData.transport === 'Y'
                        ? 'YES'
                        : 'NO'}
                    </span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Ration Allowance</span>
                    <span className="emp-detail-value">
                      {profileData.rationAllowance === 'Y' || profileData.breakfast === 'Y'
                        ? 'YES'
                        : 'NO'}
                    </span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Hazardous Duty Cover</span>
                    <span className="emp-detail-value">
                      {profileData.hazardAllowance === 'Y' || profileData.dinner === 'Y'
                        ? 'YES'
                        : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GUARDIANS / FAMILY (Matching Image 2) */}
            {activeTab === 'guardians' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Users size={18} color="#0284c7" />
                    <span>Family &amp; Guardian Details</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('guardians')}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="emp-details-grid">
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Father's Name</span>
                    <span className="emp-detail-value">{profileData.fatherName}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Mother's Name</span>
                    <span className="emp-detail-value">{profileData.motherName}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Spouse Name</span>
                    <span className="emp-detail-value">{profileData.spouseName}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Relationship</span>
                    <span className="emp-detail-value">{profileData.relationship}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Emergency Contact Person</span>
                    <span className="emp-detail-value">{profileData.emergencyContact}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Guardian Mobile Number</span>
                    <span className="emp-detail-value">{profileData.guardianMobile}</span>
                  </div>

                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Guardian Occupation / Notes</span>
                    <span className="emp-detail-value">{profileData.guardianOccupation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADDRESS (Matching Image 3) */}
            {activeTab === 'address' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Home size={18} color="#0284c7" />
                    <span>Addresses</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('address')}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Present Address */}
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7', fontSize: '0.9rem' }}>
                  Present Residential Address
                </h4>
                <div className="emp-details-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Address Line 1</span>
                    <span className="emp-detail-value">{profileData.presentAddress1}</span>
                  </div>
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Address Line 2</span>
                    <span className="emp-detail-value">{profileData.presentAddress2}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">City</span>
                    <span className="emp-detail-value">{profileData.presentCity}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">District</span>
                    <span className="emp-detail-value">{profileData.presentDistrict}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">State</span>
                    <span className="emp-detail-value">{profileData.presentState}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Pin Code</span>
                    <span className="emp-detail-value">{profileData.presentPin}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Police Station</span>
                    <span className="emp-detail-value">{profileData.presentPS}</span>
                  </div>
                </div>

                {/* Permanent Address */}
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7', fontSize: '0.9rem' }}>
                  Permanent Native Address
                </h4>
                <div className="emp-details-grid">
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Address Line 1</span>
                    <span className="emp-detail-value">{profileData.permAddress1}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">District</span>
                    <span className="emp-detail-value">{profileData.permDistrict}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">State</span>
                    <span className="emp-detail-value">{profileData.permState}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Pin Code</span>
                    <span className="emp-detail-value">{profileData.permPin}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Police Station</span>
                    <span className="emp-detail-value">{profileData.permPS}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OTHER INFO (Matching Image 4) */}
            {activeTab === 'other_info' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Settings size={18} color="#0284c7" />
                    <span>Other Information &amp; Official Credentials</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('other_info')}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="emp-otherinfo-table">
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Attendance Card ID</span>
                    <span className="emp-otherinfo-val">{profileData.attendanceCardId || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">PSARA / Regd No.</span>
                    <span className="emp-otherinfo-val">
                      {profileData.otherBputRegdNo || profileData.bputRegdNo || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">AADHAAR No.</span>
                    <span className="emp-otherinfo-val">{profileData.aadhaarNo || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">PAN No.</span>
                    <span className="emp-otherinfo-val">{profileData.panNo || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Voter ID</span>
                    <span className="emp-otherinfo-val">{profileData.voterId || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Driving License No.</span>
                    <span className="emp-otherinfo-val">
                      {profileData.drivingLicenseNo || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Account No</span>
                    <span className="emp-otherinfo-val">{profileData.bankAccountNo || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Name</span>
                    <span className="emp-otherinfo-val">
                      {profileData.bankName || 'State Bank of India (SBI)'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">IFSC Code</span>
                    <span className="emp-otherinfo-val">
                      {profileData.ifscCode || 'SBIN0010234'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Mother Name</span>
                    <span className="emp-otherinfo-val">
                      {profileData.motherNameOther || profileData.motherName || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Reference</span>
                    <span className="emp-otherinfo-val">{profileData.reference || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Qualification</span>
                    <span className="emp-otherinfo-val">{profileData.qualification || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Specialization</span>
                    <span className="emp-otherinfo-val">
                      {profileData.specialization || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Papers Published</span>
                    <span className="emp-otherinfo-val">
                      {profileData.papersPublished || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Books Written</span>
                    <span className="emp-otherinfo-val">{profileData.booksWritten || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">R &amp; D Project Undertaken</span>
                    <span className="emp-otherinfo-val">
                      {profileData.rdProjectUndertaken || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">
                      Membership of Professional Society
                    </span>
                    <span className="emp-otherinfo-val">
                      {profileData.membershipProfessionalSociety || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Workshops Attended</span>
                    <span className="emp-otherinfo-val">
                      {profileData.workshopsAttended || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">National Conferences Attended</span>
                    <span className="emp-otherinfo-val">
                      {profileData.nationalConferencesAttended || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">
                      International Conferences Attended
                    </span>
                    <span className="emp-otherinfo-val">
                      {profileData.internationalConferencesAttended || '—'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Languages</span>
                    <span className="emp-otherinfo-val">
                      {profileData.languages || 'Odia, English, Hindi'}
                    </span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Hobbies</span>
                    <span className="emp-otherinfo-val">{profileData.hobbies || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DOCUMENTS (Matching Image 5) */}
            {activeTab === 'documents' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <FileCheck2 size={18} color="#0284c7" />
                    <span>Verified Administrative Credentials ({documents.length})</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => setEditingSection('documents')}
                  >
                    <Plus size={14} />
                    <span>Add Document</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documents.map((doc) => (
                    <div key={doc.id} className="emp-doc-item">
                      <div className="emp-doc-left">
                        <FileText size={20} color="#0284c7" />
                        <div>
                          <div className="emp-doc-name">{doc.name}</div>
                          <div className="emp-doc-meta">{doc.meta}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="emp-doc-action-btn"
                          onClick={() => handleViewDocument(doc)}
                          title="View real document / verified credential"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          className="emp-doc-action-btn"
                          onClick={() => handleDownloadPdf(doc)}
                          title="Download real document in PDF"
                        >
                          <Download size={13} /> PDF
                        </button>
                        <button
                          type="button"
                          className="emp-doc-action-btn"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDeleteDocument(doc.id)}
                          title="Remove document record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: HEALTH */}
            {activeTab === 'health' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Heart size={18} color="#0284c7" />
                    <span>Occupational Health &amp; Insurance Records</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('health')}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="emp-details-grid">
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Blood Group</span>
                    <span className="emp-detail-value">{profileData.bloodGroup}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Physical Fitness</span>
                    <span className="emp-detail-value">{profileData.fitnessStatus}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Height</span>
                    <span className="emp-detail-value">{profileData.height}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Weight</span>
                    <span className="emp-detail-value">{profileData.weight}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Insurance Scheme</span>
                    <span className="emp-detail-value">{profileData.insuranceScheme}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Policy Number</span>
                    <span className="emp-detail-value">{profileData.policyNumber}</span>
                  </div>

                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Emergency Campus Hospital</span>
                    <span className="emp-detail-value">{profileData.emergencyHospital}</span>
                  </div>
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Allergies / Special Notes</span>
                    <span className="emp-detail-value">{profileData.allergies}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UNIVERSAL EDIT MODAL DIALOG (COVERS ALL TABS & SUMMARY) */}
      {editingSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setEditingSection(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                {editingSection === 'documents'
                  ? 'Upload New Guard Credential Document'
                  : `Edit ${getSectionTitle(editingSection)}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {editingSection === 'documents' ? (
              <form onSubmit={handleUploadDocumentSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="emp-form-group">
                    <label className="emp-form-label">Document Title / Credential Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PSARA Advanced Training Certificate"
                      className="emp-form-input"
                      value={newDocForm.name}
                      onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                    />
                  </div>

                  <div className="emp-form-group">
                    <label className="emp-form-label">
                      Verification Metadata / Issuing Authority
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Issued 15-10-2026 · Odisha Police &amp; Security Board"
                      className="emp-form-input"
                      value={newDocForm.meta}
                      onChange={(e) => setNewDocForm({ ...newDocForm, meta: e.target.value })}
                    />
                  </div>

                  <div className="emp-form-group">
                    <label className="emp-form-label">
                      Select Document File (PDF, PNG, JPG up to 15MB)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="emp-form-input"
                      onChange={handleFileSelect}
                    />
                    {newDocForm.fileName && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#059669',
                          marginTop: '4px',
                          fontWeight: 600,
                        }}
                      >
                        ✓ Attached: {newDocForm.fileName} ({newDocForm.fileSizeFormatted})
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    style={{
                      padding: '0.55rem 1.25rem',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.5rem',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveEdit}>
                {editingSection === 'personal' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="emp-form-group">
                      <label className="emp-form-label">Title</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">First Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Last Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Joining Date</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.joiningDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, joiningDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Date of Birth</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.empDob}
                        onChange={(e) => setEditForm({ ...editForm, empDob: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Gender</label>
                      <select
                        className="emp-form-input"
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      >
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Birth Place</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.birthPlace}
                        onChange={(e) =>
                          setEditForm({ ...editForm, birthPlace: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Total Experience</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.totalExperience}
                        onChange={(e) =>
                          setEditForm({ ...editForm, totalExperience: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Blood Group</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bloodGroup}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bloodGroup: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Marital Status</label>
                      <select
                        className="emp-form-input"
                        value={editForm.maritalStatus}
                        onChange={(e) =>
                          setEditForm({ ...editForm, maritalStatus: e.target.value })
                        }
                      >
                        <option value="MARRIED">MARRIED</option>
                        <option value="UNMARRIED">UNMARRIED</option>
                      </select>
                    </div>
                  </div>
                )}

                {editingSection === 'guardians' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="emp-form-group">
                      <label className="emp-form-label">Father's Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.fatherName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, fatherName: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Mother's Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.motherName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, motherName: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Spouse Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.spouseName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, spouseName: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Emergency Contact Person</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.emergencyContact}
                        onChange={(e) =>
                          setEditForm({ ...editForm, emergencyContact: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Guardian Mobile Number</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.guardianMobile}
                        onChange={(e) =>
                          setEditForm({ ...editForm, guardianMobile: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Guardian Occupation / Notes</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.guardianOccupation}
                        onChange={(e) =>
                          setEditForm({ ...editForm, guardianOccupation: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {editingSection === 'address' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7' }}>
                        Present Residential Address
                      </h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '0.85rem',
                        }}
                      >
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line 1</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentAddress1}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentAddress1: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line 2</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentAddress2}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentAddress2: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">City</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentCity}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentCity: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">District</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentDistrict}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentDistrict: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">State</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentState}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentState: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Pin Code</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentPin}
                            onChange={(e) =>
                              setEditForm({ ...editForm, presentPin: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7' }}>
                        Permanent Native Address
                      </h4>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '0.85rem',
                        }}
                      >
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line 1</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permAddress1}
                            onChange={(e) =>
                              setEditForm({ ...editForm, permAddress1: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">District</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permDistrict}
                            onChange={(e) =>
                              setEditForm({ ...editForm, permDistrict: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">State</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permState}
                            onChange={(e) =>
                              setEditForm({ ...editForm, permState: e.target.value })
                            }
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Pin Code</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permPin}
                            onChange={(e) =>
                              setEditForm({ ...editForm, permPin: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingSection === 'other_info' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="emp-form-group">
                      <label className="emp-form-label">PSARA / Regd No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.otherBputRegdNo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, otherBputRegdNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">AADHAAR No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.aadhaarNo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, aadhaarNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">PAN No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.panNo}
                        onChange={(e) => setEditForm({ ...editForm, panNo: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Bank Account No</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bankAccountNo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bankAccountNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Bank Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bankName}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.ifscCode}
                        onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Qualification</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.qualification}
                        onChange={(e) =>
                          setEditForm({ ...editForm, qualification: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Specialization</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.specialization}
                        onChange={(e) =>
                          setEditForm({ ...editForm, specialization: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {editingSection === 'health' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="emp-form-group">
                      <label className="emp-form-label">Blood Group</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bloodGroup}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bloodGroup: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Physical Fitness Status</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.fitnessStatus}
                        onChange={(e) =>
                          setEditForm({ ...editForm, fitnessStatus: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Height</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.height}
                        onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Weight</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Insurance Scheme</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.insuranceScheme}
                        onChange={(e) =>
                          setEditForm({ ...editForm, insuranceScheme: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Policy Number</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.policyNumber}
                        onChange={(e) =>
                          setEditForm({ ...editForm, policyNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {editingSection === 'summary' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    <div className="emp-form-group">
                      <label className="emp-form-label">Employee ID</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.employeeId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, employeeId: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">PSARA / Regd No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bputRegdNo}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bputRegdNo: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Full Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Designation</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.designation}
                        onChange={(e) =>
                          setEditForm({ ...editForm, designation: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Department</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.department}
                        onChange={(e) =>
                          setEditForm({ ...editForm, department: e.target.value })
                        }
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Mobile Number</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.mobileNo}
                        onChange={(e) => setEditForm({ ...editForm, mobileNo: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Official Email ID</label>
                      <input
                        type="email"
                        className="emp-form-input"
                        value={editForm.emailId}
                        onChange={(e) => setEditForm({ ...editForm, emailId: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Stationed Post</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.postName}
                        onChange={(e) => setEditForm({ ...editForm, postName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    style={{
                      padding: '0.55rem 1.25rem',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.55rem 1.5rem',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {isDocViewerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '1rem',
          }}
          onClick={() => setIsDocViewerOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '52rem',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={18} color="#38bdf8" />
                <strong style={{ fontSize: '0.95rem' }}>{selectedDocForView?.name}</strong>
              </div>
              <button
                type="button"
                onClick={() => setIsDocViewerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: '380px',
                maxHeight: '70vh',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {docViewerUrl ? (
                docViewerUrl.startsWith('data:image') ? (
                  <img
                    src={docViewerUrl}
                    alt={selectedDocForView?.name}
                    style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain' }}
                  />
                ) : (
                  <iframe
                    src={docViewerUrl}
                    title={selectedDocForView?.name}
                    style={{ width: '100%', height: '68vh', border: 'none' }}
                  />
                )
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Generating document preview...
                </div>
              )}
            </div>

            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {selectedDocForView?.meta}
              </span>
              <button
                type="button"
                className="emp-edit-btn"
                onClick={() => handleDownloadPdf(selectedDocForView)}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

