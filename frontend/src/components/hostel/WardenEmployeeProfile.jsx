import React, { useState } from 'react';
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
  Check,
  Building,
  Phone,
  Mail,
  Shield,
  Printer
} from 'lucide-react';
import './WardenEmployeeProfile.css';

export default function WardenEmployeeProfile({ account, onBack }) {
  // Tabs: 'personal', 'guardians', 'address', 'other_info', 'documents', 'health'
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Primary State (defaults matching 2nd image with Warden details)
  const [profileData, setProfileData] = useState({
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

    // Personal Tab Details
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

    // Guardians Tab
    fatherName: 'Mr. B. N. Routray',
    motherName: 'Mrs. S. Routray',
    spouseName: 'Mrs. P. Routray',
    emergencyContact: 'Mr. B. N. Routray',
    guardianMobile: '+91 94370 88219',
    relationship: 'Father',
    guardianOccupation: 'Retired State Govt Officer',

    // Address Tab
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

    // Other Info Tab
    bankName: 'State Bank of India (SBI)',
    bankBranch: 'Campus Autonomous Extension Counter',
    accountNumber: '34892019482',
    ifscCode: 'SBIN0010243',
    panNumber: '•••••945Q',
    aadhaarNumber: '•••• •••• 7730',
    epfUan: '101294820194',
    shiftDuty: 'General / 24x7 Resident Staff',
    biometricUid: 'BIO-HST-140',
    reportingAuthority: 'Dr. B. K. Sarap (Principal)',

    // Health Tab
    height: '172 cm',
    weight: '68 kg',
    insuranceScheme: 'Star Health Comprehensive Campus Cover',
    policyNumber: 'EMP-HLTH-2026-0982',
    emergencyHospital: 'Kalinga Hospital & Campus Health Center',
    allergies: 'None Reported',
    fitnessStatus: 'Medically Certified Fit for Active 24x7 Residence Supervision',
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProfileData({ ...editForm });
    setIsEditModalOpen(false);
    showToast('Employee personal details updated successfully.');
  };

  const handleGeneratePdf = () => {
    window.print();
  };

  return (
    <div className="emp-profile-wrapper">
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
          <h2 className="emp-profile-heading">Employee Profile</h2>
        </div>

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

      {/* Two-Column Grid */}
      <div className="emp-profile-grid">
        {/* LEFT COLUMN: Summary Card */}
        <aside className="emp-summary-card">
          <div className="emp-photo-container">
            <div className="emp-photo-ring">
              <img
                src={profileData.avatar}
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
                title="Change Profile Photo"
                onClick={() => showToast('Photo upload dialog opened.')}
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
            {/* TAB 1: PERSONAL DETAILS (EXACT MATCH TO 2ND IMAGE) */}
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
                    onClick={() => {
                      setEditForm({ ...profileData });
                      setIsEditModalOpen(true);
                    }}
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
                    <span className="emp-detail-label">Emergency Contact</span>
                    <span className="emp-detail-value">{profileData.emergencyContact}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Guardian Mobile</span>
                    <span className="emp-detail-value">{profileData.guardianMobile}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Relationship</span>
                    <span className="emp-detail-value">{profileData.relationship}</span>
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
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Home size={18} color="#0284c7" />
                    <span>Residential &amp; Permanent Address</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', color: '#0284c7' }}>Present Residential Address</h4>
                  <div className="emp-details-grid">
                    <div className="emp-detail-row full-width">
                      <span className="emp-detail-label">Address Line</span>
                      <span className="emp-detail-value">{profileData.presentAddress1}, {profileData.presentAddress2}</span>
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

            {/* TAB 4: OTHER INFO */}
            {activeTab === 'other_info' && (
              <div>
                <div className="emp-tab-inner-header">
                  <div className="emp-tab-title">
                    <Settings size={18} color="#0284c7" />
                    <span>Banking, Statutory &amp; Shift Operations</span>
                  </div>
                </div>

                <div className="emp-details-grid">
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Bank Name</span>
                    <span className="emp-detail-value">{profileData.bankName}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Branch</span>
                    <span className="emp-detail-value">{profileData.bankBranch}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Account Number</span>
                    <span className="emp-detail-value">{profileData.accountNumber}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">IFSC Code</span>
                    <span className="emp-detail-value">{profileData.ifscCode}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">PAN Number</span>
                    <span className="emp-detail-value">{profileData.panNumber}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Aadhaar (Masked)</span>
                    <span className="emp-detail-value">{profileData.aadhaarNumber}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">EPF / UAN</span>
                    <span className="emp-detail-value">{profileData.epfUan}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Shift Timing</span>
                    <span className="emp-detail-value">{profileData.shiftDuty}</span>
                  </div>

                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Biometric Punch UID</span>
                    <span className="emp-detail-value">{profileData.biometricUid}</span>
                  </div>
                  <div className="emp-detail-row">
                    <span className="emp-detail-label">Reporting Authority</span>
                    <span className="emp-detail-value">{profileData.reportingAuthority}</span>
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
                    <span>Verified Administrative Credentials</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Appointment Order & Joining Dossier', meta: 'Issued 04-06-2015 · Autonomous Secretariat' },
                    { name: 'Higher Secondary & Technical Qualification Certificates', meta: 'Verified Transcripts' },
                    { name: 'Aadhaar & PAN Identity Verification Record', meta: 'UIDAI & NSDL Digitally Verified' },
                    { name: 'Police Verification & Character Clearance Certificate', meta: 'Clear Record · Verified 2024' },
                    { name: 'Annual Occupational Health Fitness Certificate', meta: 'Fit to Work 24x7 Resident Duty' },
                  ].map((doc, idx) => (
                    <div key={idx} className="emp-doc-item">
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
                          onClick={() => showToast(`Previewing ${doc.name}`)}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          className="emp-doc-action-btn"
                          onClick={() => showToast(`Downloading ${doc.name}`)}
                        >
                          <Download size={13} /> PDF
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
      {/* EDIT MODAL DIALOG                                                     */}
      {/* ===================================================================== */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Edit Personal Details</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Middle Name</label>
                  <input
                    type="text"
                    value={editForm.middleName}
                    onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Mobile Number</label>
                  <input
                    type="text"
                    value={editForm.mobileNo}
                    onChange={(e) => setEditForm({ ...editForm, mobileNo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Email ID</label>
                  <input
                    type="email"
                    value={editForm.emailId}
                    onChange={(e) => setEditForm({ ...editForm, emailId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Blood Group</label>
                  <input
                    type="text"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Birth Place</label>
                  <input
                    type="text"
                    value={editForm.birthPlace}
                    onChange={(e) => setEditForm({ ...editForm, birthPlace: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
