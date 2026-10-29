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
  Trash2
} from 'lucide-react';
import './WardenEmployeeProfile.css';

const DEFAULT_PROFILE_DATA = {
  // Left Summary
  employeeId: '140',
  bputRegdNo: '—',
  name: 'Mr. Tanmaya Kumar Routray',
  department: 'Hostel Administration',
  designation: 'Hostel Supervisor',
  category: 'Non Teaching',
  mobileNo: '7873008197',
  emailId: 'tanmaya.routray@gift.edu.in',
  status: 'Active',
  avatar: '/candidate_photo_apna.png',

  // 1. Personal Tab Details (Image 1)
  title: 'Mr.',
  firstName: 'Tanmaya',
  lastName: 'Routray',
  middleName: 'Kumar',
  nameAlias: '—',
  joiningDate: '04-06-2015',
  empDob: '06-06-1976',
  gender: 'MALE',
  birthPlace: 'Cuttack, Odisha',
  totalExperience: '20 Year(s) 0 Month(s)',
  bloodGroup: 'A-',
  maritalStatus: 'MARRIED',
  caste: '—',
  nationality: 'Indian',
  religion: 'Hindu',
  thumb: '374',
  lunch: 'Y',
  transport: 'N',
  breakfast: 'Y',
  dinner: 'Y',

  // 2. Guardians Tab
  fatherName: 'Mr. B. N. Routray',
  motherName: 'Mrs. S. Routray',
  spouseName: 'Mrs. P. Routray',
  emergencyContact: 'Mr. B. N. Routray',
  guardianMobile: '+91 94370 88219',
  relationship: 'Father',
  guardianOccupation: 'Retired State Govt Officer',

  // 3. Address Tab
  presentAddress1: 'Staff Quarters Block C-102',
  presentAddress2: 'Campus Residential Complex',
  presentCity: 'Bhubaneswar',
  presentDistrict: 'Khordha',
  presentState: 'Odisha',
  presentPin: '751024',
  presentPS: 'Chandaka PS',

  permAddress1: 'At/PO - Tangi, Naya Sahi',
  permDistrict: 'Cuttack',
  permState: 'Odisha',
  permPin: '754022',
  permPS: 'Tangi PS',

  // 4. Other Info Tab (Exact replica of Image 2 & 3)
  attendanceCardId: '—',
  otherBputRegdNo: '—',
  aadhaarNo: '633542037780',
  panNo: '—',
  voterId: '—',
  drivingLicenseNo: '—',
  bankAccountNo: '32715690478',
  bankName: 'SBI',
  ifscCode: 'SBIN0004375',
  motherNameOther: 'Urmila Routaraya',
  reference: '—',
  qualification: 'BA',
  specialization: '—',
  papersPublished: '—',
  booksWritten: '—',
  rdProjectUndertaken: '—',
  membershipProfessionalSociety: '—',
  workshopsAttended: '—',
  nationalConferencesAttended: '—',
  internationalConferencesAttended: '—',
  languages: 'Odia, English, Hindi',
  hobbies: 'Reading, Community Service',

  // 5. Health Tab
  height: '172 cm',
  weight: '68 kg',
  insuranceScheme: 'Star Health Comprehensive Campus Cover',
  policyNumber: 'EMP-HLTH-2026-0982',
  emergencyHospital: 'Kalinga Hospital & Campus Health Center',
  allergies: 'None Reported',
  fitnessStatus: 'Medically Certified Fit for Active 24x7 Residence Supervision',
};

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', name: 'Appointment Order & Joining Dossier', meta: 'Issued 04-06-2015 · Autonomous Secretariat' },
  { id: 'doc-2', name: 'Higher Secondary & Technical Qualification Certificates', meta: 'Verified Transcripts · BPUT Board' },
  { id: 'doc-3', name: 'Aadhaar & PAN Identity Verification Record', meta: 'UIDAI & NSDL Digitally Verified' },
  { id: 'doc-4', name: 'Police Verification & Character Clearance Certificate', meta: 'Clear Record · Verified 2024' },
  { id: 'doc-5', name: 'Annual Occupational Health Fitness Certificate', meta: 'Fit to Work 24x7 Resident Duty' },
];

export default function WardenEmployeeProfile({ account, onBack }) {
  // Tabs: 'personal', 'guardians', 'address', 'other_info', 'documents', 'health'
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState(null); // 'personal' | 'guardians' | 'address' | 'other_info' | 'health' | 'summary' | 'documents' | null
  const [toastMessage, setToastMessage] = useState('');
  const photoInputRef = useRef(null);

  const isHostelAdmin = Boolean(
    account?.role === 'hostel_admin' ||
    account?.role === 'admin' ||
    account?.role === 'super_admin' ||
    account?.identity === 'WRD-ADM-01'
  );

  // Initialize Profile Data from LocalStorage if available
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('hostel_employee_profile_140');
      const savedAvatar = localStorage.getItem('hostel_officer_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedAvatar) parsed.avatar = savedAvatar;
        return { ...DEFAULT_PROFILE_DATA, ...parsed };
      }
      if (savedAvatar) {
        return { ...DEFAULT_PROFILE_DATA, avatar: savedAvatar };
      }
    } catch (e) {
      console.warn('Failed reading saved profile:', e);
    }
    return { ...DEFAULT_PROFILE_DATA };
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem('hostel_employee_docs_140');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DOCUMENTS;
  });

  // Edit Form Buffer
  const [editForm, setEditForm] = useState({ ...profileData });
  const [newDocForm, setNewDocForm] = useState({ name: '', meta: '' });

  // Listen for avatar sync from other tabs/dashboard
  useEffect(() => {
    const handleAvatarSync = () => {
      const updatedAvatar = localStorage.getItem('hostel_officer_avatar');
      if (updatedAvatar) {
        setProfileData((prev) => ({ ...prev, avatar: updatedAvatar }));
      }
    };
    window.addEventListener('hostel_avatar_changed', handleAvatarSync);
    return () => window.removeEventListener('hostel_avatar_changed', handleAvatarSync);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Profile Photo Upload & Synchronization
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
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
          localStorage.setItem('hostel_employee_profile_140', JSON.stringify(updated));
          return updated;
        });
        localStorage.setItem('hostel_officer_avatar', dataUrl);
        window.dispatchEvent(new Event('hostel_avatar_changed'));
        showToast('Profile photo updated and synchronized with Dashboard.');
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
      localStorage.setItem('hostel_employee_profile_140', JSON.stringify(updated));
      localStorage.setItem('hostel_officer_name', updated.name);
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
    setEditingSection(null);
    showToast(`${getSectionTitle(editingSection)} updated successfully.`);
  };

  const handleAddDocument = (e) => {
    e.preventDefault();
    if (!newDocForm.name.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocForm.name.trim(),
      meta: newDocForm.meta.trim() || 'Verified by Hostel Administration',
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);
    localStorage.setItem('hostel_employee_docs_140', JSON.stringify(updatedDocs));
    setNewDocForm({ name: '', meta: '' });
    setEditingSection(null);
    showToast('Document added to employee records.');
  };

  const handleDeleteDocument = (id) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    localStorage.setItem('hostel_employee_docs_140', JSON.stringify(updated));
    showToast('Document record removed.');
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
        return 'Employee Details';
    }
  };

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
            top: '20px',
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

      {/* Top Header Bar */}
      <div className="emp-profile-header-bar">
        <div className="emp-profile-title-left">
          {onBack && (
            <button type="button" className="emp-back-btn" onClick={onBack} title="Return to Dashboard">
              <ArrowLeft size={15} />
              <span>Dashboard</span>
            </button>
          )}
          <div>
            <h2 className="emp-profile-heading">Employee Profile</h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontWeight: 600 }}>Active Role Perspective:</span>
              <span style={{ background: isHostelAdmin ? '#eff6ff' : '#ecfdf5', color: isHostelAdmin ? '#1d4ed8' : '#047857', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {isHostelAdmin ? 'Hostel Administrator' : 'Resident Warden'}
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
            title="Print or Generate Employee PDF Dossier"
          >
            <FileText size={15} />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="emp-profile-grid">
        {/* LEFT COLUMN: Summary Card (Image 1 replica) */}
        <aside className="emp-summary-card">
          <div className="emp-photo-container">
            <div className="emp-photo-ring" title="Profile Photo (Click edit icon to change)">
              <img
                src={profileData.avatar || '/candidate_photo_apna.png'}
                alt={profileData.name}
                className="emp-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/candidate_photo_apna.png';
                }}
              />
              <button
                type="button"
                className="emp-photo-edit-badge"
                title="Change & Sync Profile Photo"
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

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
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
            {/* TAB 1: PERSONAL DETAILS (IMAGE 1 REPLICA) */}
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
                    <span className="emp-detail-value">{profileData.middleName}</span>
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

            {/* TAB 2: GUARDIANS */}
            {activeTab === 'guardians' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Users size={18} color="#0284c7" />
                    <span>Family &amp; Guardian Information</span>
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
                    <span className="emp-detail-label">Guardian Occupation</span>
                    <span className="emp-detail-value">{profileData.guardianOccupation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADDRESS */}
            {activeTab === 'address' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Home size={18} color="#0284c7" />
                    <span>Residential &amp; Permanent Addresses</span>
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

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#0284c7' }}>Present Residential Address</h4>
                  <div className="emp-details-grid">
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
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#0284c7' }}>Permanent Native Address</h4>
                  <div className="emp-details-grid">
                    <div className="emp-detail-row full-width">
                      <span className="emp-detail-label">Address Line</span>
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
              </div>
            )}

            {/* TAB 4: OTHER INFO (EXACT REPLICA OF IMAGE 2 & 3) */}
            {activeTab === 'other_info' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Info size={18} color="#0284c7" />
                    <span>Other Info</span>
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
                    <span className="emp-otherinfo-label">BPUT Regd No.</span>
                    <span className="emp-otherinfo-val">{profileData.otherBputRegdNo || profileData.bputRegdNo || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">AADHAAR No.</span>
                    <span className="emp-otherinfo-val">{profileData.aadhaarNo || '633542037780'}</span>
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
                    <span className="emp-otherinfo-val">{profileData.drivingLicenseNo || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Account No</span>
                    <span className="emp-otherinfo-val">{profileData.bankAccountNo || '32715690478'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Bank Name</span>
                    <span className="emp-otherinfo-val">{profileData.bankName || 'SBI'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">IFSC Code</span>
                    <span className="emp-otherinfo-val">{profileData.ifscCode || 'SBIN0004375'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Mother Name</span>
                    <span className="emp-otherinfo-val">{profileData.motherNameOther || 'Urmila Routaraya'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Reference</span>
                    <span className="emp-otherinfo-val">{profileData.reference || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Qualification</span>
                    <span className="emp-otherinfo-val">{profileData.qualification || 'BA'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Specialization</span>
                    <span className="emp-otherinfo-val">{profileData.specialization || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Papers Published</span>
                    <span className="emp-otherinfo-val">{profileData.papersPublished || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Books Written</span>
                    <span className="emp-otherinfo-val">{profileData.booksWritten || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">R &amp; D Project Undertaken</span>
                    <span className="emp-otherinfo-val">{profileData.rdProjectUndertaken || '—'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Membership of any Professional Society</span>
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
                    <span className="emp-otherinfo-label">Languages</span>
                    <span className="emp-otherinfo-val">{profileData.languages || 'Odia, English, Hindi'}</span>
                  </div>
                  <div className="emp-otherinfo-row">
                    <span className="emp-otherinfo-label">Hobbies</span>
                    <span className="emp-otherinfo-val">{profileData.hobbies || 'Reading, Community Service'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DOCUMENTS */}
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
                          onClick={() => showToast(`Previewing verified file: ${doc.name}`)}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          className="emp-doc-action-btn"
                          onClick={() => showToast(`Downloading official record: ${doc.name}`)}
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

      {/* ===================================================================== */}
      {/* UNIVERSAL EDIT MODAL DIALOG (COVERS ALL TABS)                         */}
      {/* ===================================================================== */}
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
              borderRadius: '14px',
              maxWidth: editingSection === 'other_info' ? '760px' : '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                  Edit {getSectionTitle(editingSection)}
                </h3>
                <small style={{ color: '#64748b' }}>
                  Employee: <strong>{profileData.name}</strong> · ID #{profileData.employeeId}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {editingSection === 'documents' ? (
              <form onSubmit={handleAddDocument} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="emp-form-group">
                  <label className="emp-form-label">Document Title / Credential Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BPUT Warden Service Verification Certificate"
                    className="emp-form-input"
                    value={newDocForm.name}
                    onChange={(e) => setNewDocForm({ ...newDocForm, name: e.target.value })}
                  />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Issuing Authority / Meta Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Issued by BPUT & Autonomous Campus Directorate · Verified 2026"
                    className="emp-form-input"
                    value={newDocForm.meta}
                    onChange={(e) => setNewDocForm({ ...newDocForm, meta: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.5rem 1.25rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Add Document Record
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. PERSONAL DETAILS EDIT */}
                {editingSection === 'personal' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
                      <label className="emp-form-label">Middle Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.middleName}
                        onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
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
                      <label className="emp-form-label">Name Alias</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.nameAlias}
                        onChange={(e) => setEditForm({ ...editForm, nameAlias: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Joining Date</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.joiningDate}
                        onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
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
                        onChange={(e) => setEditForm({ ...editForm, birthPlace: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Total Experience</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.totalExperience}
                        onChange={(e) => setEditForm({ ...editForm, totalExperience: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Blood Group</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Marital Status</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.maritalStatus}
                        onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Caste</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.caste}
                        onChange={(e) => setEditForm({ ...editForm, caste: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Nationality</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.nationality}
                        onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Religion</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.religion}
                        onChange={(e) => setEditForm({ ...editForm, religion: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Thumb / Biometric Code</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.thumb}
                        onChange={(e) => setEditForm({ ...editForm, thumb: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Lunch Allowance (Y/N)</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.lunch}
                        onChange={(e) => setEditForm({ ...editForm, lunch: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Transport Allowance (Y/N)</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.transport}
                        onChange={(e) => setEditForm({ ...editForm, transport: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Breakfast Allowance (Y/N)</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.breakfast}
                        onChange={(e) => setEditForm({ ...editForm, breakfast: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Dinner Allowance (Y/N)</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.dinner}
                        onChange={(e) => setEditForm({ ...editForm, dinner: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 2. GUARDIANS EDIT */}
                {editingSection === 'guardians' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Father's Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.fatherName}
                        onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Mother's Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.motherName}
                        onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Spouse Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.spouseName}
                        onChange={(e) => setEditForm({ ...editForm, spouseName: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Relationship</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.relationship}
                        onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Emergency Contact Person</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Guardian Mobile Number</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.guardianMobile}
                        onChange={(e) => setEditForm({ ...editForm, guardianMobile: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Guardian Occupation / Notes</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.guardianOccupation}
                        onChange={(e) => setEditForm({ ...editForm, guardianOccupation: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 3. ADDRESS EDIT */}
                {editingSection === 'address' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7' }}>Present Residential Address</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line 1</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentAddress1}
                            onChange={(e) => setEditForm({ ...editForm, presentAddress1: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line 2</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentAddress2}
                            onChange={(e) => setEditForm({ ...editForm, presentAddress2: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">City</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentCity}
                            onChange={(e) => setEditForm({ ...editForm, presentCity: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">District</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentDistrict}
                            onChange={(e) => setEditForm({ ...editForm, presentDistrict: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">State</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentState}
                            onChange={(e) => setEditForm({ ...editForm, presentState: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Pin Code</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentPin}
                            onChange={(e) => setEditForm({ ...editForm, presentPin: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Police Station</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.presentPS}
                            onChange={(e) => setEditForm({ ...editForm, presentPS: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: '#0284c7' }}>Permanent Native Address</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                        <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="emp-form-label">Address Line</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permAddress1}
                            onChange={(e) => setEditForm({ ...editForm, permAddress1: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">District</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permDistrict}
                            onChange={(e) => setEditForm({ ...editForm, permDistrict: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">State</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permState}
                            onChange={(e) => setEditForm({ ...editForm, permState: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Pin Code</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permPin}
                            onChange={(e) => setEditForm({ ...editForm, permPin: e.target.value })}
                          />
                        </div>
                        <div className="emp-form-group">
                          <label className="emp-form-label">Police Station</label>
                          <input
                            type="text"
                            className="emp-form-input"
                            value={editForm.permPS}
                            onChange={(e) => setEditForm({ ...editForm, permPS: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. OTHER INFO EDIT (ALL 22 FIELDS FROM IMAGE 2 & 3) */}
                {editingSection === 'other_info' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Attendance Card ID</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.attendanceCardId}
                        onChange={(e) => setEditForm({ ...editForm, attendanceCardId: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">BPUT Regd No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.otherBputRegdNo}
                        onChange={(e) => setEditForm({ ...editForm, otherBputRegdNo: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">AADHAAR No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.aadhaarNo}
                        onChange={(e) => setEditForm({ ...editForm, aadhaarNo: e.target.value })}
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
                      <label className="emp-form-label">Voter ID</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.voterId}
                        onChange={(e) => setEditForm({ ...editForm, voterId: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Driving License No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.drivingLicenseNo}
                        onChange={(e) => setEditForm({ ...editForm, drivingLicenseNo: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Bank Account No</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bankAccountNo}
                        onChange={(e) => setEditForm({ ...editForm, bankAccountNo: e.target.value })}
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
                    <div className="emp-form-group">
                      <label className="emp-form-label">Mother Name</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.motherNameOther}
                        onChange={(e) => setEditForm({ ...editForm, motherNameOther: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Reference</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.reference}
                        onChange={(e) => setEditForm({ ...editForm, reference: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Qualification</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.qualification}
                        onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Specialization</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Papers Published</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.papersPublished}
                        onChange={(e) => setEditForm({ ...editForm, papersPublished: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Books Written</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.booksWritten}
                        onChange={(e) => setEditForm({ ...editForm, booksWritten: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">R &amp; D Project Undertaken</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.rdProjectUndertaken}
                        onChange={(e) => setEditForm({ ...editForm, rdProjectUndertaken: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Membership of any Professional Society</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.membershipProfessionalSociety}
                        onChange={(e) => setEditForm({ ...editForm, membershipProfessionalSociety: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Workshops Attended</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.workshopsAttended}
                        onChange={(e) => setEditForm({ ...editForm, workshopsAttended: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">National Conferences Attended</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.nationalConferencesAttended}
                        onChange={(e) => setEditForm({ ...editForm, nationalConferencesAttended: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">International Conferences Attended</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.internationalConferencesAttended}
                        onChange={(e) => setEditForm({ ...editForm, internationalConferencesAttended: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Languages</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.languages}
                        onChange={(e) => setEditForm({ ...editForm, languages: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Hobbies</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.hobbies}
                        onChange={(e) => setEditForm({ ...editForm, hobbies: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 5. HEALTH EDIT */}
                {editingSection === 'health' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Blood Group</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Physical Fitness Status</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.fitnessStatus}
                        onChange={(e) => setEditForm({ ...editForm, fitnessStatus: e.target.value })}
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
                        onChange={(e) => setEditForm({ ...editForm, insuranceScheme: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Policy Number</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.policyNumber}
                        onChange={(e) => setEditForm({ ...editForm, policyNumber: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Emergency Campus Hospital</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.emergencyHospital}
                        onChange={(e) => setEditForm({ ...editForm, emergencyHospital: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="emp-form-label">Allergies / Special Medical Notes</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.allergies}
                        onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* 6. SUMMARY EDIT */}
                {editingSection === 'summary' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Employee ID</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.employeeId}
                        onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">BPUT Regd No.</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.bputRegdNo}
                        onChange={(e) => setEditForm({ ...editForm, bputRegdNo: e.target.value })}
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
                      <label className="emp-form-label">Department</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Designation</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      />
                    </div>
                    <div className="emp-form-group">
                      <label className="emp-form-label">Category</label>
                      <input
                        type="text"
                        className="emp-form-input"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                      <label className="emp-form-label">Employment Status</label>
                      <select
                        className="emp-form-input"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Transferred">Transferred</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    style={{ padding: '0.55rem 1.25rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.55rem 1.5rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
