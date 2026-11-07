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
  Upload,
  Camera,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Plus,
  Trash2,
  User,
  Award,
  BookOpen
} from 'lucide-react';
import './OfficialEmployeeProfile.css';
import { resolveAcademicProfile } from './academicProfilesData.js';
import { downloadAcademicDocument, getAcademicDocumentPreviewUrl } from '../../utils/academicDocumentService.js';

export default function OfficialEmployeeProfile({
  account = {},
  role = '',
  roleTitle = '',
  rolePerspective = '',
  onBack = null,
}) {
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const photoInputRef = useRef(null);

  // 1. Resolve base profile data
  const initialResolved = resolveAcademicProfile(account, role);
  const effectiveId = initialResolved.employeeId || account?.identity || 'EMP-ACAD-01';

  // 2. State initialized from LocalStorage if user previously edited
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(`apna_employee_profile_${effectiveId}`);
      const savedAvatar = localStorage.getItem(`apna_employee_avatar_${effectiveId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedAvatar) parsed.avatar = savedAvatar;
        return { ...initialResolved, ...parsed };
      }
      if (savedAvatar) {
        return { ...initialResolved, avatar: savedAvatar };
      }
    } catch (e) {
      console.warn('Failed reading saved profile:', e);
    }
    return { ...initialResolved };
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const savedDocs = localStorage.getItem(`apna_employee_docs_${effectiveId}`);
      if (savedDocs) return JSON.parse(savedDocs);
    } catch {}
    return initialResolved.documents || [];
  });

  // Edit Form Buffer
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

  // Document viewer modal
  const [selectedDocForView, setSelectedDocForView] = useState(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState(null);

  // Sync when account changes
  useEffect(() => {
    const nextResolved = resolveAcademicProfile(account, role);
    const id = nextResolved.employeeId || 'EMP-ACAD-01';
    let localData = { ...nextResolved };
    try {
      const saved = localStorage.getItem(`apna_employee_profile_${id}`);
      if (saved) {
        localData = { ...localData, ...JSON.parse(saved) };
      }
      const savedAvatar = localStorage.getItem(`apna_employee_avatar_${id}`);
      if (savedAvatar) {
        localData.avatar = savedAvatar;
      }
    } catch {}
    setProfileData(localData);
    setEditForm(localData);
  }, [account, role]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Photo upload
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
          localStorage.setItem(`apna_employee_profile_${effectiveId}`, JSON.stringify(updated));
          return updated;
        });
        localStorage.setItem(`apna_employee_avatar_${effectiveId}`, dataUrl);
        showToast('Profile photo updated successfully.');
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
      localStorage.setItem(`apna_employee_profile_${effectiveId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Storage save failed:', err);
    }

    showToast(`${getSectionTitle(editingSection)} updated successfully.`);
    setEditingSection(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit. Please choose a smaller file.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const autoTitle = cleanFileName
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      setNewDocForm(prev => ({
        ...prev,
        name: prev.name.trim() ? prev.name : autoTitle,
        meta: prev.meta.trim() ? prev.meta : `Official Academic Upload · ${file.name} (${sizeFormatted}) · Verified ${new Date().toLocaleDateString('en-GB')}`,
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

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocForm.name.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocForm.name.trim(),
      meta: newDocForm.meta.trim() || `Verified & Uploaded on ${new Date().toLocaleDateString('en-GB')}`,
      fileData: newDocForm.fileData || null,
      fileName: newDocForm.fileName || null,
      fileType: newDocForm.fileType || (newDocForm.fileData ? 'application/pdf' : null),
      fileSize: newDocForm.fileSize || null,
      uploadedAt: new Date().toISOString(),
      uploadedBy: account?.name || profileData.name || 'Academic Administrator',
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    try {
      localStorage.setItem(`apna_employee_docs_${effectiveId}`, JSON.stringify(updatedDocs));
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
    showToast('Academic credential document uploaded and attached to personnel dossier.');
  };

  const handleDeleteDocument = (id) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    try {
      localStorage.setItem(`apna_employee_docs_${effectiveId}`, JSON.stringify(updated));
    } catch {}
    showToast('Document record removed from dossier.');
  };

  const handleViewDocument = (doc) => {
    setSelectedDocForView(doc);
    const preview = getAcademicDocumentPreviewUrl(doc, profileData);
    setDocViewerUrl(preview);
    setIsDocViewerOpen(true);
  };

  const handleDownloadPdf = (doc) => {
    downloadAcademicDocument(doc, profileData);
    showToast(`Downloading official academic PDF: ${doc.name}`);
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
        return 'Academic Documents';
      default:
        return 'Official Profile';
    }
  };

  const displayTitle = roleTitle || profileData.roleTitle || `Official CMS Profile: ${profileData.name}`;
  const displayPerspective = rolePerspective || profileData.activeRolePerspective || 'Academic Officer';

  return (
    <div className="emp-profile-wrapper">
      {/* Hidden file input for Photo Upload */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.5rem',
            boxShadow: '0 0.5rem 1.5rem rgba(0,0,0,0.3)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Top Header Bar */}
      <div className="emp-profile-header-bar">
        <div className="emp-profile-title-left">
          {onBack && (
            <button
              type="button"
              className="emp-back-btn"
              onClick={onBack}
              title="Return to Main Dashboard"
            >
              <ArrowLeft size={15} />
              <span>← Back to Dashboard</span>
            </button>
          )}
          <div>
            <h2 className="emp-profile-heading">{displayTitle}</h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600 }}>Active Role Perspective:</span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                {displayPerspective}
              </span>
              <span>· Employee ID: {profileData.employeeId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
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
            title="Print or Generate Academic Dossier PDF"
          >
            <FileText size={15} />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="emp-profile-grid">
        {/* LEFT COLUMN: Summary Card */}
        <aside className="emp-summary-card">
          <div className="emp-photo-container">
            <div className="emp-photo-ring" title="Profile Photo (Click pencil icon to upload)">
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
                title="Change & Upload Profile Photo"
                onClick={() => photoInputRef.current && photoInputRef.current.click()}
              >
                <Camera size={14} />
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
                <td className="emp-summary-label">BPUT Regd No.</td>
                <td className="emp-summary-val">{profileData.bputRegdNo}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Name</td>
                <td className="emp-summary-val">{profileData.name}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Department</td>
                <td className="emp-summary-val">{profileData.department}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Designation</td>
                <td className="emp-summary-val">{profileData.designation}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Category</td>
                <td className="emp-summary-val">{profileData.category}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Mobile No</td>
                <td className="emp-summary-val">{profileData.mobileNo}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Email ID</td>
                <td className="emp-summary-val">{profileData.emailId}</td>
              </tr>
              <tr>
                <td className="emp-summary-label">Status</td>
                <td className="emp-summary-val">
                  <span className="emp-status-pill">{profileData.status}</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '0.0625rem solid #f1f5f9' }}>
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

        {/* RIGHT COLUMN: Tabbed Details */}
        <div className="emp-tabs-section">
          {/* Tabs Navigation Bar */}
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
              <span>Documents</span>
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

          {/* Tab Panel */}
          <div className="emp-tab-panel">
            {/* TAB 1: PERSONAL DETAILS */}
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
                    <span className="emp-detail-value">{profileData.nameAlias || '—'}</span>
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
                    <span className="emp-detail-label">Thumb</span>
                    <span className="emp-detail-value">{profileData.thumb}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Lunch</span>
                    <span className="emp-detail-value">{profileData.lunch}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Transport</span>
                    <span className="emp-detail-value">{profileData.transport}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Breakfast</span>
                    <span className="emp-detail-value">{profileData.breakfast}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Dinner</span>
                    <span className="emp-detail-value">{profileData.dinner}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GUARDIANS TAB */}
            {activeTab === 'guardians' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Users size={18} color="#0284c7" />
                    <span>Guardian / Family Information</span>
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
                    <span className="emp-detail-value">{profileData.spouseName || '—'}</span>
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
                    <span className="emp-detail-label">Guardian Occupation</span>
                    <span className="emp-detail-value">{profileData.guardianOccupation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADDRESS TAB */}
            {activeTab === 'address' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Home size={18} color="#0284c7" />
                    <span>Address Information</span>
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

                <h4 style={{ fontSize: '0.9rem', color: '#0369a1', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                  Present Residential Address (Campus Accommodation)
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
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Police Station</span>
                    <span className="emp-detail-value">{profileData.presentPS}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', color: '#0369a1', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
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

            {/* TAB 4: OTHER INFO TAB */}
            {activeTab === 'other_info' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Settings size={18} color="#0284c7" />
                    <span>Other Info / Institutional Academic Record</span>
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
                    <span className="emp-otherinfo-val">{profileData.attendanceCardId}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">BPUT Regd No.</span>
                    <span className="emp-otherinfo-val">{profileData.otherBputRegdNo || profileData.bputRegdNo}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Aadhaar No.</span>
                    <span className="emp-otherinfo-val">{profileData.aadhaarNo}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">PAN No.</span>
                    <span className="emp-otherinfo-val">{profileData.panNo}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Voter ID</span>
                    <span className="emp-otherinfo-val">{profileData.voterId}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Driving License No.</span>
                    <span className="emp-otherinfo-val">{profileData.drivingLicenseNo}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Account No.</span>
                    <span className="emp-otherinfo-val">{profileData.bankAccountNo}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Name</span>
                    <span className="emp-otherinfo-val">{profileData.bankName}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">IFSC Code</span>
                    <span className="emp-otherinfo-val">{profileData.ifscCode}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Mother Name</span>
                    <span className="emp-otherinfo-val">{profileData.motherNameOther || profileData.motherName}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Reference</span>
                    <span className="emp-otherinfo-val">{profileData.reference}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Qualification</span>
                    <span className="emp-otherinfo-val">{profileData.qualification}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Specialization</span>
                    <span className="emp-otherinfo-val">{profileData.specialization}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Papers Published</span>
                    <span className="emp-otherinfo-val">{profileData.papersPublished}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Books Written</span>
                    <span className="emp-otherinfo-val">{profileData.booksWritten || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">R&amp;D Projects Undertaken</span>
                    <span className="emp-otherinfo-val">{profileData.rdProjectUndertaken || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Memberships of Professional Societies</span>
                    <span className="emp-otherinfo-val">{profileData.membershipProfessionalSociety || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Workshops Attended</span>
                    <span className="emp-otherinfo-val">{profileData.workshopsAttended || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">National Conferences Attended</span>
                    <span className="emp-otherinfo-val">{profileData.nationalConferencesAttended || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">International Conferences Attended</span>
                    <span className="emp-otherinfo-val">{profileData.internationalConferencesAttended || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Languages Known</span>
                    <span className="emp-otherinfo-val">{profileData.languages || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Hobbies &amp; Extracurricular</span>
                    <span className="emp-otherinfo-val">{profileData.hobbies || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <FileCheck2 size={18} color="#0284c7" />
                    <span>Verified Administrative &amp; Academic Credentials</span>
                  </div>
                  <button
                    type="button"
                    className="emp-edit-btn"
                    onClick={() => openEditModal('documents')}
                  >
                    <Plus size={13} />
                    <span>Upload Document</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  All credentials listed below have undergone digital authentication by the Autonomous Secretariat and Academic Council.
                </p>

                {documents.map((doc) => (
                  <div key={doc.id} className="emp-doc-item">
                    <div className="emp-doc-left">
                      <FileCheck2 size={24} color="#0284c7" />
                      <div>
                        <div className="emp-doc-name">{doc.name}</div>
                        <div className="emp-doc-meta">{doc.meta}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="emp-doc-action-btn"
                        onClick={() => handleViewDocument(doc)}
                        title="View credential"
                      >
                        <Eye size={13} />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        className="emp-doc-action-btn"
                        onClick={() => handleDownloadPdf(doc)}
                        title="Download official PDF certificate"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        className="emp-doc-action-btn"
                        style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Remove document record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: HEALTH TAB */}
            {activeTab === 'health' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Heart size={18} color="#0284c7" />
                    <span>Health &amp; Medical Records</span>
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
                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Physical Fitness</span>
                    <span className="emp-detail-value">{profileData.physicalFitness}</span>
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
                    <span className="emp-detail-label">Blood Pressure</span>
                    <span className="emp-detail-value">{profileData.bloodPressure}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Chronic Conditions</span>
                    <span className="emp-detail-value">{profileData.chronicConditions}</span>
                  </div>

                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Vaccination Status</span>
                    <span className="emp-detail-value">{profileData.vaccinationStatus}</span>
                  </div>

                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Medical Fitness Certificate</span>
                    <span className="emp-detail-value">{profileData.medicalFitnessCert}</span>
                  </div>

                  <div className="emp-detail-row full-width">
                    <span className="emp-detail-label">Insurance Scheme</span>
                    <span className="emp-detail-value">{profileData.insuranceScheme}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Policy Number</span>
                    <span className="emp-detail-value">{profileData.policyNumber}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Emergency Hospital</span>
                    <span className="emp-detail-value">{profileData.emergencyHospital}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              borderRadius: '0.625rem',
              width: '100%',
              maxWidth: '52rem',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1.25rem 3rem rgba(0,0,0,0.4)',
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
                borderBottom: '0.0625rem solid #e2e8f0',
                background: '#0f172a',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <div style={{ flex: 1, minHeight: '30rem', background: '#f8fafc', padding: '0.5rem' }}>
              {docViewerUrl ? (
                <iframe
                  src={docViewerUrl}
                  title="Document Preview"
                  style={{ width: '100%', height: '100%', minHeight: '30rem', border: 'none' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Preparing document preview...
                </div>
              )}
            </div>
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: '0.0625rem solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.625rem',
              }}
            >
              <button
                type="button"
                className="emp-back-btn"
                onClick={() => setIsDocViewerOpen(false)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className="emp-generate-pdf-btn"
                onClick={() => selectedDocForView && handleDownloadPdf(selectedDocForView)}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR SECTIONS */}
      {editingSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99997,
            padding: '1rem',
          }}
          onClick={() => setEditingSection(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '0.625rem',
              width: '100%',
              maxWidth: editingSection === 'other_info' ? '47.5rem' : '42.5rem',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1.25rem 3rem rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '0.0625rem solid #e2e8f0',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={16} color="#0284c7" />
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  Edit {getSectionTitle(editingSection)}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {editingSection === 'documents' ? (
                <form onSubmit={handleAddDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="emp-form-group">
                    <label className="emp-form-label">Document Title *</label>
                    <input
                      type="text"
                      className="emp-form-input"
                      value={newDocForm.name}
                      onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                      placeholder="e.g. Doctoral Degree Certificate (Ph.D.)"
                      required
                    />
                  </div>

                  <div className="emp-form-group">
                    <label className="emp-form-label">Issuing Authority / Metadata</label>
                    <input
                      type="text"
                      className="emp-form-input"
                      value={newDocForm.meta}
                      onChange={(e) => setNewDocForm({ ...newDocForm, meta: e.target.value })}
                      placeholder="e.g. Issued by BPUT Autonomous Academic Board · Oct 2026"
                    />
                  </div>

                  <div className="emp-form-group">
                    <label className="emp-form-label">Select File to Attach (PDF, PNG, JPG)</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="emp-form-input"
                      accept=".pdf,image/*"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="emp-back-btn"
                      onClick={() => setEditingSection(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="emp-edit-btn">
                      Upload Credential
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {editingSection === 'summary' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Full Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Employee ID</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.employeeId || ''}
                          onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">BPUT Regd No.</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.bputRegdNo || ''}
                          onChange={(e) => setEditForm({ ...editForm, bputRegdNo: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Department</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.department || ''}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Designation</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.designation || ''}
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Category</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Mobile No</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.mobileNo || ''}
                          onChange={(e) => setEditForm({ ...editForm, mobileNo: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Email ID</label>
                        <input
                          type="email"
                          className="emp-form-input"
                          value={editForm.emailId || ''}
                          onChange={(e) => setEditForm({ ...editForm, emailId: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {editingSection === 'personal' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Title</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">First Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.firstName || ''}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Last Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.lastName || ''}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Joining Date</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.joiningDate || ''}
                          onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Emp Date of Birth</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.empDob || ''}
                          onChange={(e) => setEditForm({ ...editForm, empDob: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Gender</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.gender || ''}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Birth Place</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.birthPlace || ''}
                          onChange={(e) => setEditForm({ ...editForm, birthPlace: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Total Experience</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.totalExperience || ''}
                          onChange={(e) => setEditForm({ ...editForm, totalExperience: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Blood Group</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.bloodGroup || ''}
                          onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Marital Status</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.maritalStatus || ''}
                          onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {editingSection === 'guardians' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Father's Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.fatherName || ''}
                          onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Mother's Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.motherName || ''}
                          onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Spouse Name</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.spouseName || ''}
                          onChange={(e) => setEditForm({ ...editForm, spouseName: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Relationship</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.relationship || ''}
                          onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Emergency Contact Person</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.emergencyContact || ''}
                          onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Guardian Mobile Number</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.guardianMobile || ''}
                          onChange={(e) => setEditForm({ ...editForm, guardianMobile: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {editingSection === 'address' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="emp-form-label">Present Address Line 1</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.presentAddress1 || ''}
                          onChange={(e) => setEditForm({ ...editForm, presentAddress1: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Present City</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.presentCity || ''}
                          onChange={(e) => setEditForm({ ...editForm, presentCity: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Present Pin Code</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.presentPin || ''}
                          onChange={(e) => setEditForm({ ...editForm, presentPin: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="emp-form-label">Permanent Address Line 1</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.permAddress1 || ''}
                          onChange={(e) => setEditForm({ ...editForm, permAddress1: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Permanent District</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.permDistrict || ''}
                          onChange={(e) => setEditForm({ ...editForm, permDistrict: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Permanent Pin Code</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.permPin || ''}
                          onChange={(e) => setEditForm({ ...editForm, permPin: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {editingSection === 'other_info' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Qualification</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.qualification || ''}
                          onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Specialization</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.specialization || ''}
                          onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Aadhaar No.</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.aadhaarNo || ''}
                          onChange={(e) => setEditForm({ ...editForm, aadhaarNo: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">PAN No.</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.panNo || ''}
                          onChange={(e) => setEditForm({ ...editForm, panNo: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Bank Account No.</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.bankAccountNo || ''}
                          onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Bank Name &amp; IFSC</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={`${editForm.bankName || ''} · ${editForm.ifscCode || ''}`}
                          onChange={(e) => {
                            const [b, i] = e.target.value.split('·');
                            setEditForm({ ...editForm, bankName: (b || '').trim(), ifscCode: (i || '').trim() });
                          }}
                        />
                      </div>
                      <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="emp-form-label">Papers Published</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.papersPublished || ''}
                          onChange={(e) => setEditForm({ ...editForm, papersPublished: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {editingSection === 'health' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.875rem' }}>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Height</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.height || ''}
                          onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Weight</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.weight || ''}
                          onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Blood Pressure</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.bloodPressure || ''}
                          onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group">
                        <label className="emp-form-label">Chronic Conditions</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.chronicConditions || ''}
                          onChange={(e) => setEditForm({ ...editForm, chronicConditions: e.target.value })}
                        />
                      </div>
                      <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="emp-form-label">Physical Fitness</label>
                        <input
                          type="text"
                          className="emp-form-input"
                          value={editForm.physicalFitness || ''}
                          onChange={(e) => setEditForm({ ...editForm, physicalFitness: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="emp-back-btn"
                      onClick={() => setEditingSection(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="emp-edit-btn">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

