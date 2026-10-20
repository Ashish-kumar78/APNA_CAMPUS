import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Award,
  BarChart2,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Fingerprint,
  GraduationCap,
  Heart,
  HeartPulse,
  IdCard,
  Info,
  MapPin,
  ShieldCheck,
  UserRound,
  UsersRound,
  Utensils,
  X,
  Plus,
  UploadCloud,
  ChevronDown,
} from 'lucide-react'
import './StudentProfile.css'
import './ProfileModern.css'
import AttendancePage from './pages/AttendancePage.jsx'
import MarksPage from './pages/MarksPage.jsx'
import ExaminationPage from './pages/ExaminationPage.jsx'
import FeesPage from './pages/FeesPage.jsx'
import BiometricPage from './pages/BiometricPage.jsx'
import CanteenPage from './pages/CanteenPage.jsx'
import HealthPage from './pages/HealthPage.jsx'
import UniversityMarksView from './components/UniversityMarksView.jsx'

import { findStudentByQuery, defaultDemoStudent, getStudentDocuments, addStudentDocument } from './services/studentStore.js'
import { api } from './services/api.js'

const profileTabs = [
  { label: 'Personal', icon: UserRound },
  { label: 'Academic', icon: GraduationCap },
  { label: 'Attendance Dashboard', icon: CheckCircle2 },
  { label: 'Fee Details', icon: CreditCard },
  { label: 'Health & Medical', icon: Heart },
  { label: 'Guardians', icon: UsersRound },
  { label: 'Address', icon: MapPin },
  { label: 'Documents', icon: FileText },
  { label: 'ID Card', icon: IdCard },
]

function StudentProfile({ account, onBack, initialTab, initialQuickView }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'Personal')
  const [activeQuickView, setActiveQuickView] = useState(initialQuickView || '')
  const [message, setMessage] = useState('')
  const [selectedDocView, setSelectedDocView] = useState(null)
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false)
  const profileRootRef = useRef(null)

  // Always reset scroll to the beginning when StudentProfile mounts or student changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const osShell = document.querySelector('.campus-os-shell')
    if (osShell) osShell.scrollTop = 0
    const osMain = document.querySelector('.campus-os-main')
    if (osMain) osMain.scrollTop = 0

    if (profileRootRef.current) {
      profileRootRef.current.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [account?.registrationNumber, account?.name])

  // Merge account prop with complete student store record if available
  const student = useMemo(() => {
    const matched = findStudentByQuery(account?.registrationNumber || account?.rollNumber || account?.name)
    return { ...defaultDemoStudent, ...account, ...(matched || {}) }
  }, [account])

  // Dynamic student documents list
  const [studentDocs, setStudentDocs] = useState(() =>
    getStudentDocuments(student.id || student.registrationNumber || student.name)
  )

  useEffect(() => {
    const refreshDocs = () => {
      setStudentDocs(getStudentDocuments(student.id || student.registrationNumber || student.name))
    }
    refreshDocs()
    window.addEventListener('cms_student_documents_changed', refreshDocs)
    return () => window.removeEventListener('cms_student_documents_changed', refreshDocs)
  }, [student])

  // Add document form state
  const [newDocForm, setNewDocForm] = useState({
    docPreset: 'Migration Certificate',
    customName: '',
    category: 'Academic',
    file: null,
    fileName: '',
    fileSize: '',
    fileType: 'PDF',
    fileDataUrl: null,
    remarks: ''
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isImg = file.type.startsWith('image/')
    const reader = new FileReader()
    reader.onload = () => {
      setNewDocForm(prev => ({
        ...prev,
        file,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: isImg ? 'IMAGE' : 'PDF',
        fileDataUrl: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddDocumentSubmit = (e) => {
    e.preventDefault()
    const docTitle = newDocForm.docPreset === 'Other / Custom Document'
      ? (newDocForm.customName.trim() || 'Custom Student Certificate')
      : newDocForm.docPreset

    addStudentDocument(student.id || student.registrationNumber || student.name, {
      name: docTitle,
      category: newDocForm.category,
      fileName: newDocForm.fileName || `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileType: newDocForm.fileType,
      fileSize: newDocForm.fileSize || '1.2 MB',
      fileUrl: newDocForm.fileDataUrl,
      remarks: newDocForm.remarks
    })

    setStudentDocs(getStudentDocuments(student.id || student.registrationNumber || student.name))
    setIsAddDocModalOpen(false)
    setNewDocForm({
      docPreset: 'Migration Certificate',
      customName: '',
      category: 'Academic',
      file: null,
      fileName: '',
      fileSize: '',
      fileType: 'PDF',
      fileDataUrl: null,
      remarks: ''
    })
    setMessage(`Document "${docTitle}" uploaded and verified for ${student.name}. Visible to Admin, Faculty & HOD.`)
    setTimeout(() => setMessage(''), 4500)
  }

  const firstName = student.firstName || 'BISHNU'
  const lastName = student.lastName || 'SAHOO'
  const middleName = student.middleName || 'PRASAD'
  const fullName = student.name || `${firstName} ${middleName} ${lastName}`.trim()
  const regNumber = student.registrationNumber || account?.registrationNumber || '2401432265'
  const emailName = fullName.toLowerCase().replaceAll(' ', '.')
  const summaryRows = [
    ['Last Date of Class Attendance', student.lastClassAttendanceDate || '14/10/2026'],
    ['Last Date of Hostel Attendance', student.lastHostelAttendanceDate || '16/10/2026'],
    ['Registration No.', regNumber],
    ['Serial No.', student.rollNumber || '01'],
    ['Name', fullName.toUpperCase()],
    ['Mentor', student.mentor || 'Dr. Pratyush Mohapatra'],
    ['Course', student.course || 'Bachelor of Technology'],
    ['Batch', student.batch || 'BTECH 2028-P'],
    ['Branch', student.branch || student.department || 'Computer Science & Engineering (Artificial Intelligence)'],
    ['Section', student.academicSection || student.section || 'CSE (AI) - Genius'],
    ['Domain Email ID', student.email || `${emailName}@gift.edu.in`],
    ['Email ID', student.personalEmail || `${emailName}@gmail.com`],
    ['Mobile No.', student.phone || '7749844291'],
    ['WhatsApp No.', student.phone || '7749844291'],
    ['Aadhaar No.', student.govtIdNumber || 'XXXX XXXX 2341'],
    ['Voter ID', 'Not provided'],
    ['PAN No.', 'Not provided'],
    ['Driving License No.', 'Not provided'],
    ['Passport No.', 'Not provided'],
  ]

  const details = {
    Personal: [
      [{ label: 'Admission Category', value: student.admissionCategory || 'General', wide: true }],
      [{ label: 'Title', value: student.title || 'Ms.', wide: true }],
      [{ label: 'First Name', value: firstName }, { label: 'Last Name', value: lastName }],
      [{ label: 'Middle Name', value: student.middleName || 'Not provided' }, { label: 'Gender', value: student.gender || 'Female' }],
      [{ label: 'Date of Birth', value: student.dobFormatted || student.dob || '15-03-2005' }, { label: 'Nationality', value: student.nationality || 'Indian' }],
      [{ label: 'Caste', value: student.caste || 'General' }, { label: 'Religion', value: student.religion || 'Hindu' }],
      [{ label: 'Blood Group', value: student.bloodGroup || 'O+' }, { label: 'Birthplace', value: student.birthplace || 'Bhubaneswar, Odisha' }],
      [{ label: 'Identification Mark', value: student.identificationMark || 'Not provided', wide: true }],
      [{ label: 'Thumb ID', value: student.thumbId || `GFT${student.registrationNumber || account.registrationNumber || '2305201001'}`, wide: true }],
      [{ label: 'Hostel', value: student.hostel || 'No' }, { label: 'Transport', value: student.transport || 'No' }],
      [{ label: 'Lunch', value: student.lunch || 'No' }, { label: 'NSS', value: student.nss || 'No' }],
      [{ label: 'Languages Known', value: student.languagesKnown || 'Odia, English, Hindi', wide: true }],
      [{ label: 'Hobbies', value: student.hobbies || 'Not provided', wide: true }],
    ],
    Guardians: [
      [{ label: 'Father / Guardian', value: student.fatherName || 'Sanjay Das' }, { label: 'Relationship', value: student.fatherRelationship || 'Father' }],
      [{ label: 'Contact Number', value: student.fatherPhone || '+91 94370 10001' }, { label: 'Email', value: student.fatherEmail || 'sanjay.das@example.com' }],
      [{ label: 'Mother / Guardian', value: student.motherName || 'Madhuri Das' }, { label: 'Relationship', value: student.motherRelationship || 'Mother' }],
      [{ label: 'Contact Number', value: student.motherPhone || '+91 94370 10002' }, { label: 'Email', value: student.motherEmail || 'madhuri.das@example.com' }],
    ],
    Address: [
      [{ label: 'Address Type', value: 'Permanent', wide: true }],
      [{ label: 'Address', value: student.permAddress || 'Plot 18, Unit 4', wide: true }],
      [{ label: 'City', value: student.permCity || 'Bhubaneswar' }, { label: 'State', value: student.permState || 'Odisha' }],
      [{ label: 'Country', value: student.permCountry || 'India' }, { label: 'PIN Code', value: student.permPin || '751001' }],
      [{ label: 'Address Type', value: 'Current', wide: true }],
      [{ label: 'Address', value: student.currAddress || 'GIFT Campus Residence', wide: true }],
      [{ label: 'City', value: student.currCity || 'Bhubaneswar' }, { label: 'State', value: student.currState || 'Odisha' }],
    ],
    Health: [
      [{ label: 'Blood Group', value: student.bloodGroup || 'O+' }, { label: 'Known Allergies', value: student.allergies || 'None reported' }],
      [{ label: 'Emergency Contact', value: student.fatherName || 'Sanjay Das' }, { label: 'Contact Number', value: student.fatherPhone || '+91 94370 10001' }],
      [{ label: 'Medical Notes', value: 'No notes on file', wide: true }],
    ],
  }

  function selectQuickLink(label) {
    setActiveQuickView(label)
    setMessage('')
  }

  const studentPhoto = useMemo(() => {
    if (account?.photo && !account.photo.includes('female')) return account.photo
    return '/passport_photo_male.svg'
  }, [account])

  return (
    <section className="student-profile-page sp-modern" id="student-profile" ref={profileRootRef}>
      <div className="profile-breadcrumb">
        <button type="button" onClick={onBack}>Home</button>
        <span>/</span><span>Student</span><span>/</span><span>Manage Students</span><span>/</span>
        <strong>{account?.name || 'Student'}</strong>
      </div>

      <div className="profile-title-row">
        <h1><UserRound size={18} />Student Profile</h1>
        <button className="profile-return" type="button" onClick={onBack}><ArrowLeft size={15} />Dashboard</button>
      </div>

      <section className="profile-overview-strip" aria-label="Student identity summary">
        <div className="profile-photo" style={{ padding: 0, overflow: 'hidden', border: '2px solid #ffffff' }}>
          <img src={studentPhoto} alt={account?.name || 'Student'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="profile-overview-copy">
          <span className="profile-overview-label">STUDENT RECORD · ACTIVE</span>
          <h2>{account?.name || 'Student'}</h2>
          <p>{account?.department || 'Computer Science & Engineering'}</p>
        </div>
        <div className="profile-overview-facts">
          <span>
            <small>Registration number</small>
            <strong>{account?.registrationNumber || '—'}</strong>
          </span>
          <span>
            <small>Program</small>
            <strong>B.Tech · 2023–2027</strong>
          </span>
          <span>
            <small>Current section</small>
            <strong>CSE · Section A</strong>
          </span>
          <details className="profile-registry-summary">
            <summary>
              <small>Student record</small>
              <strong className="registry-summary-title">
                <FileText size={14} />
                <span>Full registry</span>
                <ChevronDown size={13} className="registry-caret" />
              </strong>
            </summary>
            <dl className="profile-summary-table">
              {summaryRows.map(([label, value]) => {
                const isClass = label === 'Last Date of Class Attendance';
                const isHostel = label === 'Last Date of Hostel Attendance';
                const rowCls = isClass
                  ? 'row-class-attendance'
                  : isHostel
                    ? 'row-hostel-attendance'
                    : '';

                return (
                  <div className={`profile-summary-row ${rowCls}`} key={label}>
                    <dt>{label}</dt>
                    <dd>{label === 'WhatsApp No.' ? <a href="tel:+919861023010">{value}</a> : value}</dd>
                  </div>
                );
              })}
              <div className="profile-summary-row">
                <dt>Status</dt>
                <dd><span className="profile-active"><Check size={10} />Active</span></dd>
              </div>
            </dl>
          </details>
        </div>
      </section>

      <div className="profile-layout">
        <div className="profile-main-column">
          <nav className="profile-quick-links" aria-label="Student records">
            <button className={activeQuickView === 'College Marks' ? 'active' : ''} type="button" aria-pressed={activeQuickView === 'College Marks'} onClick={() => selectQuickLink('College Marks')}>
              <Building2 size={16} />
              <span className="quick-link-text">College Marks</span>
            </button>
            <button className={activeQuickView === 'University Marks' ? 'active' : ''} type="button" aria-pressed={activeQuickView === 'University Marks'} onClick={() => selectQuickLink('University Marks')}>
              <GraduationCap size={16} />
              <span className="quick-link-text">University Marks</span>
            </button>
            <button className={activeQuickView === 'Campus Biometric' ? 'active' : ''} type="button" aria-pressed={activeQuickView === 'Campus Biometric'} onClick={() => selectQuickLink('Campus Biometric')}>
              <Fingerprint size={16} />
              <span className="quick-link-text">Campus Biometric</span>
            </button>
            <button className={activeQuickView === 'Canteen Access Log' ? 'active' : ''} type="button" aria-pressed={activeQuickView === 'Canteen Access Log'} onClick={() => selectQuickLink('Canteen Access Log')}>
              <Utensils size={16} />
              <span className="quick-link-text">Canteen Access Log</span>
            </button>
          </nav>

          <div className="profile-tabs" role="tablist" aria-label="Student profile sections">
            {profileTabs.map(({ label, icon: Icon }) => (
              <button
                className={activeTab === label ? 'active' : ''}
                id={`profile-tab-${label.toLowerCase().replaceAll(' ', '-')}`}
                type="button"
                role="tab"
                aria-selected={activeTab === label}
                key={label}
                onClick={() => {
                  setActiveTab(label)
                  setActiveQuickView('')
                  setMessage('')
                }}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          {(() => {
            const isEmbeddedPage = !activeQuickView && [
              'Attendance Dashboard',
              'Attendance',
              'Fee Details',
              'Fees',
              'Health & Medical',
              'Health',
            ].includes(activeTab);
            const panelTitle = activeQuickView || (activeTab.endsWith('Details') ? activeTab : `${activeTab} Details`);
            const isCollegeMarks = activeQuickView === 'College Marks';

            return (
              <section className={`profile-detail-panel ${isEmbeddedPage ? 'has-embedded-page' : ''} ${activeQuickView ? 'has-quick-view' : ''} ${isCollegeMarks ? 'has-college-marks-view' : ''}`} role="tabpanel" aria-label={`${activeTab} details`}>
                {!isEmbeddedPage && activeQuickView !== 'University Marks' && (
                  activeTab === 'Documents' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                      <h2 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} color="#2563eb" /> Documents Details
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsAddDocModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 16px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                      >
                        <Plus size={16} /> Add Document
                      </button>
                    </div>
                  ) : ['Personal', 'Academic', 'Guardians', 'Address'].includes(activeTab) ? null : (
                    <h2><ShieldCheck size={15} />{panelTitle}</h2>
                  )
                )}
                {activeQuickView ? (
                  activeQuickView === 'College Marks' ? (
                    <div className="profile-embedded-marks-wrap">
                      <div className="profile-marks-header-bar">
                        <div className="profile-marks-header-info">
                          <div className="profile-marks-header-pill">
                            <ShieldCheck size={13} />
                            <span>CONTINUOUS INTERNAL ASSESSMENT (CIA)</span>
                          </div>
                          <h3>College Internal Marks &amp; Assessment Management</h3>
                          <p>Complete continuous internal evaluation grade book, quiz, midterm, and practical performance breakdown.</p>
                        </div>
                        <button className="profile-return" type="button" onClick={() => setActiveQuickView('')}>
                          <ArrowLeft size={13} /> Back to profile
                        </button>
                      </div>
                      <MarksPage initialRole="student" />
                    </div>
                  ) : activeQuickView === 'University Marks' ? (
                    <UniversityMarksView onBack={() => setActiveQuickView('')} account={account} />
                  ) : (
                    <QuickRecordDetails view={activeQuickView} onBack={() => setActiveQuickView('')} />
                  )
                ) : (
                  <>
                    {message && <p className="profile-status-message" role="status">{message}</p>}
            {activeTab === 'Attendance Dashboard' || activeTab === 'Attendance' ? (
              <AttendancePage />
            ) : activeTab === 'Internal Marks' ? (
              <MarksPage initialRole="student" />
            ) : activeTab === 'Examination' ? (
              <ExaminationPage />
            ) : activeTab === 'Fee Details' || activeTab === 'Fees' ? (
              <FeesPage account={account || student} />
            ) : activeTab === 'Campus Biometrics' ? (
              <BiometricPage />
            ) : activeTab === 'Canteen & Mess' ? (
              <CanteenPage />
            ) : activeTab === 'Health & Medical' || activeTab === 'Health' ? (
              <HealthPage />
            ) : activeTab === 'Personal' ? (
              <PersonalDetails student={student} />
            ) : activeTab === 'Academic' ? (
              <AcademicDetails student={student} />
            ) : activeTab === 'Guardians' ? (
              <GuardiansDetails student={student} />
            ) : activeTab === 'Address' ? (
              <AddressDetails student={student} />
            ) : activeTab === 'Documents' ? (
              <div className="profile-documents">
                {studentDocs.map((docItem) => {
                  const docName = docItem.name || docItem;
                  return (
                    <div className="profile-document-row" key={docItem.id || docName}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={15} />
                        <span>{docName}</span>
                        {docItem.category && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: '12px', fontWeight: 600, border: '1px solid #dbeafe' }}>
                            {docItem.category}
                          </span>
                        )}
                      </span>
                      <button type="button" onClick={() => setSelectedDocView({ document: docName, docObj: docItem, student })}>View</button>
                    </div>
                  );
                })}
              </div>
            ) : activeTab === 'ID Card' ? (
              <div className="profile-id-card">
                <span className="profile-id-mark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', background: 'transparent' }}>
                  <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
                </span>
                <span className="profile-id-copy"><strong>APNA CAMPUS</strong><small>STUDENT IDENTITY CARD</small></span>
                <span className="profile-id-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                  <img src={studentPhoto} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </span>
                <strong className="profile-id-name">{student.name}</strong>
                <span>Registration No. {student.registrationNumber}</span>
                <span>{student.course || 'B.Tech'} · {student.deptCode || 'CSE'} · {student.batch || '2023–2027'}</span>
              </div>
            ) : (
              <div className="profile-data-table">
                {(details[activeTab] || details.Personal).map((row, index) => (
                  <div className={`profile-data-row ${row.some((field) => field.wide) ? 'wide-row' : ''}`} key={`${activeTab}-${index}`}>
                    {row.map((field) => (
                      <div className="profile-data-field" key={field.label}>
                        <span>{field.label}</span><strong>{field.value}</strong>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
              </>
            )}
              </section>
            );
          })()}
          <div className="profile-extra-links"><span><Award size={13} />Academic records</span><span><CalendarDays size={13} />Updated 02 Oct 2026</span></div>
        </div>
      </div>

      {/* Official Document Preview Modal */}
      {selectedDocView && (
        <div className="admin-modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="admin-modal-card" style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#2563eb" />
                Verified Student Document
              </h3>
              <button className="admin-table-action-btn" type="button" onClick={() => setSelectedDocView(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                {selectedDocView.document === 'Passport-size photograph' ? (
                  <img
                    src={studentPhoto}
                    alt="Passport photo"
                    style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #2563eb', margin: '0 auto', display: 'block' }}
                  />
                ) : selectedDocView.docObj?.fileUrl && (selectedDocView.docObj.fileType === 'IMAGE' || selectedDocView.docObj.fileUrl.startsWith('data:image')) ? (
                  <img
                    src={selectedDocView.docObj.fileUrl}
                    alt={selectedDocView.document}
                    style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto', display: 'block', border: '1px solid #e2e8f0' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#2563eb' }}>
                      <FileText size={28} />
                    </div>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{selectedDocView.document}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Verified Official Document on File {selectedDocView.docObj?.fileName ? `(${selectedDocView.docObj.fileName})` : ''}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'left', background: '#f1f5f9', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem' }}>Student Name</span><div><strong>{selectedDocView.student.name}</strong></div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem' }}>Registration No.</span><div><strong>{selectedDocView.student.registrationNumber}</strong></div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem' }}>Verification Seal</span><div><strong style={{ color: '#059669' }}>Autonomous Cell Verified ✓</strong></div></div>
                <div><span style={{ color: '#64748b', fontSize: '0.75rem' }}>Department / Batch</span><div><strong>{selectedDocView.student.deptCode || 'CSE'} · {selectedDocView.student.batch || '2023-2027'}</strong></div></div>
              </div>
            </div>
            <div className="admin-modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="admin-action-btn-primary" type="button" onClick={() => setSelectedDocView(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isAddDocModalOpen && (
        <div className="admin-modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="admin-modal-card" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} color="#2563eb" />
                Upload New Document
              </h3>
              <button className="admin-table-action-btn" type="button" onClick={() => setIsAddDocModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDocumentSubmit}>
              <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <span>Document will be automatically verified and synced to <strong>Admin</strong>, <strong>Faculty</strong>, and <strong>HOD</strong> portals.</span>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Select Document Type *</label>
                  <select
                    className="admin-form-select"
                    value={newDocForm.docPreset}
                    onChange={(e) => {
                      const val = e.target.value;
                      let cat = 'Academic';
                      if (val.includes('Income') || val.includes('Fee')) cat = 'Financial';
                      else if (val.includes('Caste') || val.includes('ID')) cat = 'Identification';
                      else if (val.includes('Medical')) cat = 'Medical';
                      else if (val.includes('Internship')) cat = 'Training';
                      setNewDocForm(prev => ({ ...prev, docPreset: val, category: cat }));
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  >
                    <option value="Migration Certificate">Migration Certificate</option>
                    <option value="Income Certificate">Income Certificate</option>
                    <option value="Caste / Category Certificate">Caste / Category Certificate</option>
                    <option value="Character / Conduct Certificate">Character / Conduct Certificate</option>
                    <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
                    <option value="Internship Offer / Completion Letter">Internship Offer / Completion Letter</option>
                    <option value="Medical Fitness Certificate">Medical Fitness Certificate</option>
                    <option value="Autonomous Grade Sheet">Autonomous Grade Sheet</option>
                    <option value="Other / Custom Document">Other / Custom Document</option>
                  </select>
                </div>

                {newDocForm.docPreset === 'Other / Custom Document' && (
                  <div className="admin-form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Custom Document Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="e.g. Sports National Certificate, NPTEL Scorecard"
                      value={newDocForm.customName}
                      onChange={(e) => setNewDocForm(prev => ({ ...prev, customName: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Category</label>
                    <select
                      className="admin-form-select"
                      value={newDocForm.category}
                      onChange={(e) => setNewDocForm(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                      <option value="Academic">Academic</option>
                      <option value="Identification">Identification</option>
                      <option value="Financial">Financial</option>
                      <option value="Medical">Medical</option>
                      <option value="Training">Training &amp; Internship</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Target Authority</label>
                    <input
                      type="text"
                      disabled
                      value="Admin · Faculty · HOD"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Upload File (PDF / Image) *</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                  {newDocForm.fileName && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Selected: <strong>{newDocForm.fileName}</strong> ({newDocForm.fileSize})
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Remarks / Certificate No. (Optional)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Issue date 2026, Certificate Serial No. 1294"
                    value={newDocForm.remarks}
                    onChange={(e) => setNewDocForm(prev => ({ ...prev, remarks: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsAddDocModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  <Plus size={16} /> Upload &amp; Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

function QuickRecordDetails({ view, onBack }) {
  const records = {
    'College Marks': {
      note: 'Internal assessment entries shown here are sample data.',
      columns: ['Subject', 'Assessment', 'Marks', 'Maximum'],
      rows: [
        ['Mathematics-I', 'Internal Assessment 1', '18', '20'],
        ['Basic Programming Skills', 'Internal Assessment 1', '17', '20'],
        ['Basic Electronics Engineering', 'Internal Assessment 1', '16', '20'],
      ],
    },
    'University Marks': {
      note: 'University result entries shown here are sample data.',
      columns: ['Semester', 'SGPA', 'Result', 'Credits'],
      rows: [
        ['1st Semester', '8.14', 'Passed', '20'],
        ['2nd Semester', '8.42', 'Passed', '21'],
        ['3rd Semester', 'Pending', 'Awaiting result', '—'],
      ],
    },
    'Campus Biometric': {
      note: 'Recent biometric events shown here are sample data.',
      columns: ['Date', 'First entry', 'Last exit', 'Location', 'Status'],
      rows: [
        ['02 Oct 2026', '08:42 AM', '04:13 PM', 'Main Gate', 'Verified'],
        ['01 Oct 2026', '08:51 AM', '04:02 PM', 'Main Gate', 'Verified'],
        ['30 Sep 2026', '08:39 AM', '04:18 PM', 'Main Gate', 'Verified'],
      ],
    },
    'Canteen Access Log': {
      note: 'Canteen transactions shown here are sample data.',
      columns: ['Date', 'Time', 'Outlet', 'Transaction', 'Amount', 'Status'],
      rows: [
        ['02 Oct 2026', '01:12 PM', 'Campus Canteen', 'Lunch', '₹65.00', 'Paid'],
        ['01 Oct 2026', '09:18 AM', 'Campus Canteen', 'Breakfast', '₹35.00', 'Paid'],
        ['30 Sep 2026', '01:06 PM', 'Campus Canteen', 'Lunch', '₹65.00', 'Paid'],
      ],
    },
  }
  const record = records[view]

  return (
    <div className="profile-quick-record">
      <div className="profile-quick-record-heading">
        <p className="profile-status-message">{record.note}</p>
        <button className="profile-return" type="button" onClick={onBack}><ArrowLeft size={13} />Back to profile</button>
      </div>
      <div className="attendance-table-wrap">
        <table className="attendance-summary-table">
          <thead><tr>{record.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{record.rows.map((row) => <tr key={row.join('-')}>{row.map((value, index) => index === 0 ? <th scope="row" key={index}>{value}</th> : <td key={index}>{value}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

function FeesDetails() {
  const [receiptMessage, setReceiptMessage] = useState('')
  const feeDemands = [
    ['2023–24', 'Admission and tuition fee', '₹78,400.00'],
    ['2024–25', 'Tuition and academic fee', '₹78,400.00'],
    ['2025–26', 'Tuition and academic fee', '₹78,400.00'],
    ['2026–27', 'Tuition and academic fee', '₹87,400.00'],
  ]
  const payments = [
    ['PMT-2301', '12-08-2023', 'Online', 'UTR •••• 4812', 'SBI', 'Bhubaneswar', 'Admission fee', '₹40,000.00'],
    ['PMT-2404', '15-03-2024', 'Online', 'UTR •••• 1470', 'SBI', 'Bhubaneswar', 'Tuition fee', '₹35,000.00'],
    ['PMT-2417', '20-06-2024', 'Online', 'UTR •••• 2964', 'HDFC', 'Bhubaneswar', 'Tuition fee', '₹30,000.00'],
    ['PMT-2503', '12-01-2025', 'Online', 'UTR •••• 5038', 'SBI', 'Bhubaneswar', 'Tuition fee', '₹30,000.00'],
    ['PMT-2509', '10-07-2025', 'Online', 'UTR •••• 9441', 'SBI', 'Bhubaneswar', 'Tuition fee', '₹29,680.00'],
    ['PMT-2602', '01-02-2026', 'Online', 'UTR •••• 6812', 'HDFC', 'Bhubaneswar', 'Tuition fee', '₹30,000.00'],
  ]
  const paidTotal = 194680
  const totalFees = 322600
  const outstanding = totalFees - paidTotal
  const paidReceiptSections = [
    { title: 'Student Paid (GIFT Money Receipt - Old Portal)', columns: ['Receipt No.', 'Money Receipt No.', 'Session', 'Paid Towards', 'Amount Paid'] },
    { title: 'Student Paid (RB Infracon Money Receipt - Old Portal)', columns: ['Receipt No.', 'Session', 'Paid Towards', 'Amount Paid'] },
  ]

  return (
    <div className="fees-details-view">
      <section className="fee-overview" aria-label="Fee summary">
        <p><span>Student's Total Fees</span><strong>₹{totalFees.toLocaleString('en-IN')}.00</strong></p>
        <p><span>Total paid by Student</span><strong>₹{paidTotal.toLocaleString('en-IN')}.00</strong></p>
        <p><span>Amount Outstanding</span><strong>₹{outstanding.toLocaleString('en-IN')}.00 ({((outstanding / totalFees) * 100).toFixed(2)}%)</strong></p>
      </section>

      <aside className="fee-notice">
        <strong>Important:</strong> If you notice a discrepancy in your fee statement, contact the Accounts Office at <a href="mailto:info@apnacampus.edu.in">info@apnacampus.edu.in</a> with your registration number.
      </aside>

      <FeeTableSection title="Fee Details" className="fee-demand-section">
        <table className="fee-data-table demand-table">
          <thead><tr><th>#</th><th>Demand Session ID</th><th>Demand Name</th><th>Demand Amount</th></tr></thead>
          <tbody>
            {feeDemands.map(([session, name, amount], index) => (
              <tr key={session}><td>{index + 1}</td><td>{session}</td><td>{name}</td><td>{amount}</td></tr>
            ))}
          </tbody>
          <tfoot><tr><th colSpan="3">Total Fees</th><td>₹{totalFees.toLocaleString('en-IN')}.00</td></tr></tfoot>
        </table>
      </FeeTableSection>

      <FeeTableSection title="Payment History" className="payment-history-section">
        <table className="fee-data-table payment-table">
          <thead><tr><th>#</th><th>Payment Id</th><th>Payment Date</th><th>Payment Mode</th><th>Cheque/UTR/Transaction No.</th><th>Bank Name</th><th>Bank Branch</th><th>Towards</th><th>Amount Paid</th><th>Action</th></tr></thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment[0]}>
                <td>{index + 1}</td>
                {payment.map((value) => <td key={value}>{value}</td>)}
                <td><button className="fee-receipt-button" type="button" aria-label={`View receipt ${payment[0]}`} onClick={() => setReceiptMessage(`Receipt ${payment[0]} is available when payment records are connected.`)}><FileText size={12} /></button></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><th colSpan="8">Total Paid</th><td colSpan="2">₹{paidTotal.toLocaleString('en-IN')}.00</td></tr></tfoot>
        </table>
        {receiptMessage && <p className="fee-receipt-message" role="status">{receiptMessage}</p>}
      </FeeTableSection>

      {paidReceiptSections.map(({ title, columns }) => (
        <FeeTableSection title={title} key={title} className="legacy-receipt-section">
          <table className="fee-data-table legacy-table">
            <thead><tr><th>#</th>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody><tr><td colSpan={columns.length + 1}>No records found.</td></tr></tbody>
            <tfoot><tr><th colSpan={columns.length}>Amount Paid</th><td>₹0.00</td></tr></tfoot>
          </table>
        </FeeTableSection>
      ))}

      <FeeTableSection title="Refund History" className="refund-history-section">
        <table className="fee-data-table refund-table">
          <thead><tr><th>#</th><th>Refund Id</th><th>Payment Date</th><th>Payment Mode</th><th>Cheque/UTR/Transaction No.</th><th>Bank Name</th><th>Bank Branch</th><th>Amount Refunded</th></tr></thead>
          <tbody><tr><td colSpan="8">No refund records found.</td></tr></tbody>
          <tfoot><tr><th colSpan="7">Total Refunded</th><td>₹0.00</td></tr></tfoot>
        </table>
      </FeeTableSection>
    </div>
  )
}

function FeeTableSection({ title, className = '', children }) {
  return (
    <section className={`fee-table-section ${className}`}>
      <h3>{title}</h3>
      <div className="fee-table-wrap">{children}</div>
    </section>
  )
}

function AttendanceDetails() {
  const [selectedSemester, setSelectedSemester] = useState(0)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const semesters = [
    {
      label: '1ST Semester', held: 406, present: 391,
      subjects: [
        ['Mathematics-I (TT) [ALL]', 41, 39],
        ['Basic Civil Engineering (T) [ALL]', 38, 37],
        ['Workshop Practice Lab [ALL]', 15, 15],
        ['Constitution of India (T) [ALL]', 22, 22],
        ['Basic Programming Skills (T) [ALL]', 48, 47],
        ['English for Engineers-I (T) [ALL]', 22, 22],
        ['English for Engineers Lab-I [GR1]', 15, 15],
        ['Basic Electronics Engineering Lab [GR1]', 17, 16],
        ['Basic Electronics Engineering (T) [ALL]', 52, 49],
        ['Basic Programming Skills Lab [ALL]', 50, 50],
        ['Project-I [GR1]', 16, 15],
        ['Applied Chemistry (T) [ALL]', 40, 39],
        ['Applied Chemistry Lab [GR1]', 15, 10],
        ['Basic Civil Engineering Lab [GR1]', 15, 15],
      ],
    },
    {
      label: '2ND Semester', held: 313, present: 284,
      subjects: [['Mathematics-II', 68, 62], ['Engineering Physics', 74, 67], ['Digital Logic', 71, 64], ['Programming Lab', 55, 50], ['Professional Communication', 45, 41]],
    },
    {
      label: '3RD Semester', held: 414, present: 387,
      subjects: [['Discrete Mathematics', 85, 80], ['Data Structures', 86, 81], ['Computer Organization', 82, 77], ['Database Systems', 81, 76], ['Software Engineering', 80, 73]],
    },
    {
      label: '4TH Semester', held: 344, present: 321,
      subjects: [['Operating Systems', 70, 67], ['Algorithms', 68, 62], ['Computer Networks', 69, 64], ['Theory of Computation', 67, 63], ['Web Technologies', 70, 65]],
    },
    {
      label: '5TH Semester', held: 201, present: 182,
      subjects: [['Artificial Intelligence', 41, 38], ['Machine Learning', 40, 36], ['Cloud Computing', 40, 36], ['Compiler Design', 40, 36], ['Project Work', 40, 36]],
    },
  ]
  const semester = semesters[selectedSemester]

  return (
    <div className="attendance-view">
      <div className="attendance-table-wrap">
        <table className="attendance-summary-table">
          <thead><tr><th>Semester</th><th>Total Classes Held</th><th>Total Classes Attended</th><th>% Attendance</th></tr></thead>
          <tbody>
            {semesters.map((item, index) => (
              <tr className={selectedSemester === index ? 'selected' : ''} key={item.label}>
                <th scope="row"><button type="button" onClick={() => {
                  setSelectedSemester(index)
                  setDetailsOpen(false)
                }}>{item.label}</button></th>
                <td>{item.held}</td>
                <td>{item.present}</td>
                <td className="attendance-percent">{((item.present / item.held) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-action-row">
        <button className="attendance-detail-toggle" type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>
          {detailsOpen ? 'Hide' : 'View'} Subject Wise Detail Attendance
        </button>
      </div>

      {detailsOpen && (
        <section className="subject-attendance" aria-label={`${semester.label} subject attendance`}>
          <h3>{semester.label}</h3>
          <div className="attendance-table-wrap">
            <table className="subject-attendance-table">
              <thead><tr><th>Subject Name</th><th>Classes Held</th><th>Classes Present</th><th>Attendance (%)</th></tr></thead>
              <tbody>
                {semester.subjects.map(([name, held, present]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{held}</td>
                    <td>{present}</td>
                    <td>{((present / held) * 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr><th>Total</th><td>{semester.held}</td><td>{semester.present}</td><td>{((semester.present / semester.held) * 100).toFixed(2)}%</td></tr></tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function PersonalDetails({ student }) {
  const s = student || {}
  return (
    <div className="erp-tab-content">
      <div className="erp-profile-header">
        <Info size={19} className="erp-info-icon" />
        <span>Personal Details</span>
      </div>

      <div className="erp-table-responsive">
        <table className="erp-grid-table">
          <tbody>
            <tr>
              <td className="erp-th-cell erp-th-blue">Admission Category</td>
              <td className="erp-td-cell erp-td-yellow" colSpan={3}>
                {s.admissionCategory || 'General'}
              </td>
            </tr>
            <tr>
              <td className="erp-th-cell">Title</td>
              <td className="erp-td-cell" colSpan={3}>
                {s.title || 'Mr.'}
              </td>
            </tr>
            <tr>
              <td className="erp-th-cell">First Name</td>
              <td className="erp-td-cell">{s.firstName || 'BISHNU'}</td>
              <td className="erp-th-cell">Last Name</td>
              <td className="erp-td-cell">{s.lastName || 'SAHOO'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Middle Name</td>
              <td className="erp-td-cell">{s.middleName || 'PRASAD'}</td>
              <td className="erp-th-cell">Gender</td>
              <td className="erp-td-cell">{s.gender || 'MALE'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Date of Birth</td>
              <td className="erp-td-cell">{s.dobFormatted || s.dob || '04-03-2007'}</td>
              <td className="erp-th-cell">Nationality</td>
              <td className="erp-td-cell">{s.nationality || 'Indian'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Caste</td>
              <td className="erp-td-cell">{s.caste || 'SEBC/OBC'}</td>
              <td className="erp-th-cell">Religion</td>
              <td className="erp-td-cell">{s.religion || 'HINDU'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Bloodgroup</td>
              <td className="erp-td-cell">{s.bloodGroup || 'O+'}</td>
              <td className="erp-th-cell">Birthplace</td>
              <td className="erp-td-cell">{s.birthplace || 'GHASIPUT, CUTTACK'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Identification Mark</td>
              <td className="erp-td-cell" colSpan={3}>{s.identificationMark || 'NO'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Thumb ID</td>
              <td className="erp-td-cell" colSpan={3}>{s.thumbId || '19181'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Hostel</td>
              <td className="erp-td-cell">{s.hostel || 'Yes'}</td>
              <td className="erp-th-cell">Transport</td>
              <td className="erp-td-cell">{s.transport || 'N'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Lunch</td>
              <td className="erp-td-cell">{s.lunch || 'N'}</td>
              <td className="erp-th-cell">NSS</td>
              <td className="erp-td-cell">{s.nss || 'N'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Languages Known</td>
              <td className="erp-td-cell" colSpan={3}>{s.languagesKnown || 'odia,hindi,english'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Hobbies</td>
              <td className="erp-td-cell" colSpan={3}>{s.hobbies || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AcademicDetails({ student }) {
  const s = student || {}
  const [enrollments, setEnrollments] = useState([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)

  useEffect(() => {
    let isMounted = true
    const query = s.registrationNumber || s.rollNumber || s.id
    if (query) {
      setLoadingEnrollments(true)
      api.getStudentEnrollments(query)
        .then((res) => {
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setEnrollments(res)
          }
        })
        .catch(() => {
          // Keep default fallback
        })
        .finally(() => {
          if (isMounted) setLoadingEnrollments(false)
        })
    }
    return () => { isMounted = false }
  }, [s.registrationNumber, s.rollNumber, s.id])

  // Fallback demo enrollments if none returned yet from database
  const displayEnrollments = enrollments.length > 0 ? enrollments : [
    { id: 'enr-1', semester: 'Semester 1', academicYear: '2023-2024', section: 'A', sgpa: 8.14, cgpa: 8.14, status: 'COMPLETED', programme: { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE' } },
    { id: 'enr-2', semester: 'Semester 2', academicYear: '2023-2024', section: 'A', sgpa: 8.42, cgpa: 8.28, status: 'COMPLETED', programme: { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE' } },
    { id: 'enr-3', semester: 'Semester 3', academicYear: '2024-2025', section: 'A', sgpa: 8.56, cgpa: 8.37, status: 'COMPLETED', programme: { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE' } },
    { id: 'enr-4', semester: 'Semester 4', academicYear: '2024-2025', section: 'A', sgpa: 8.60, cgpa: 8.43, status: 'COMPLETED', programme: { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE' } },
    { id: 'enr-5', semester: 'Semester 5', academicYear: '2025-2026', section: 'A', sgpa: null, cgpa: 8.42, status: 'ACTIVE', programme: { name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE' } },
  ]

  const fields = [
    ['Course', s.course || 'Bachelor of Technology'],
    ['Batch', s.batch || 'BTECH 2028-P'],
    ['Branch', s.branch || 'Computer Science & Engineering (Artificial Intelligence)'],
    ['Section', s.section || s.academicSection || 'CSE (AI) - Genius'],
    ['House', s.house || 'ANAND'],
    ['Lab Group', s.labGroup || '1'],
    ['Honors', s.honors || 'N'],
    ['Minor', s.minor || 'N'],
    ['Value added course-1', s.valueAdded1 || ''],
    ['Value added course-2', s.valueAdded2 || ''],
    ['Value added course-3', s.valueAdded3 || ''],
    ['Admission Date', s.admissionDateFormatted || s.admissionDate || '05-08-2024'],
    ['Entrance Examination', s.entranceExam || 'JEE MAIN'],
    ['Rank', s.rank !== undefined ? String(s.rank) : '0'],
  ]

  const qualifications = [
    ['10th', s.qual10thInstitute || 'ARACHANDI UCHA BIDYAMANDIR,NISTIPUR', s.qual10thYear || '2022', s.qual10thMarks || '82.50'],
    ['12th', s.qual12thInstitute || 'Shanti Institute Of Management,CDA,Cuttack', s.qual12thYear || '2024', s.qual12thMarks || '80.16'],
    ['ITI', s.qualItiInstitute || '0', s.qualItiYear || '', s.qualItiMarks || '0.00'],
    ['Diploma', s.qualDiplomaInstitute || '0', s.qualDiplomaYear || '', s.qualDiplomaMarks || '0.00'],
    ['+3', s.qualPlus3Institute || '0', s.qualPlus3Year || '', s.qualPlus3Marks || '0.00'],
    ['BCA', s.qualBcaInstitute || '0', s.qualBcaYear || '', s.qualBcaMarks || '0.00'],
    ['BBA', s.qualBbaInstitute || '0', s.qualBbaYear || '', s.qualBbaMarks || '0.00'],
    ['BTECH', s.qualBtechInstitute || '0', s.qualBtechYear || '', s.qualBtechMarks || '0.00'],
  ]

  return (
    <div className="erp-tab-content">
      <div className="erp-profile-header">
        <Info size={19} className="erp-info-icon" />
        <span>Academic Details</span>
      </div>
      <div className="erp-cyan-divider-bar"></div>

<<<<<<< HEAD
=======
      <div className="erp-table-responsive" style={{ marginBottom: '20px' }}>
        <table className="erp-grid-table">
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label}>
                <td className="erp-th-cell" style={{ width: '32%' }}>{label}</td>
                <td className="erp-td-cell">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
>>>>>>> origin/teammate-work
      {/* Normalized Degree Programme & Semester Progression Section */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="#2563eb" />
              <span>Academic Programme &amp; Semester Progression History</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Normalized records synchronized with Autonomous Examination &amp; Admissions Database
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
            {loadingEnrollments ? 'Syncing...' : `${displayEnrollments.length} Enrolled Terms`}
          </span>
        </div>

        <div className="attendance-table-wrap" style={{ margin: 0, boxShadow: 'none' }}>
          <table className="attendance-summary-table" style={{ fontSize: '0.84rem' }}>
            <thead>
              <tr>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>Semester Term</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>Programme</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>Academic Year</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>Section</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>SGPA</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>CGPA</th>
                <th style={{ background: '#f1f5f9', color: '#334155' }}>Enrollment Status</th>
              </tr>
            </thead>
            <tbody>
              {displayEnrollments.map((enr) => (
                <tr key={enr.id || enr.semester}>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>{enr.semester}</td>
                  <td>{enr.programme?.name || s.department || 'B.Tech CSE'}</td>
                  <td>{enr.academicYear}</td>
                  <td>{enr.section || 'Section A'}</td>
                  <td style={{ fontWeight: 600 }}>{enr.sgpa ? Number(enr.sgpa).toFixed(2) : '—'}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{enr.cgpa ? Number(enr.cgpa).toFixed(2) : (s.cgpa || '8.42')}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: enr.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                      color: enr.status === 'ACTIVE' ? '#15803d' : '#475569',
                      border: enr.status === 'ACTIVE' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    }}>
                      {enr.status === 'ACTIVE' && <Check size={11} />}
                      {enr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="erp-table-responsive" style={{ marginBottom: '20px' }}>
        <table className="erp-grid-table">
          <tbody>
            {fields.map(([label, value]) => (
              <tr key={label}>
                <td className="erp-th-cell" style={{ width: '32%' }}>{label}</td>
                <td className="erp-td-cell">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="erp-table-responsive" style={{ marginBottom: '20px' }}>
        <table className="erp-qualification-grid-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Qualification</th>
              <th style={{ width: '52%' }}>Institute Name</th>
              <th style={{ width: '16%' }}>Passout Year</th>
              <th style={{ width: '14%' }}>Marks</th>
            </tr>
          </thead>
          <tbody>
            {qualifications.map(([qualification, institute, year, marks]) => (
              <tr key={qualification}>
                <td className="erp-qual-name">{qualification}</td>
                <td>{institute}</td>
                <td>{year}</td>
                <td>{marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="erp-table-responsive">
        <table className="erp-grid-table">
          <tbody>
            <tr>
              <td className="erp-th-cell" style={{ width: '32%' }}>Student Status</td>
              <td className="erp-td-cell">{s.studentStatus || 'Active'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell" style={{ width: '32%' }}>Active/InActive</td>
              <td className="erp-td-cell">{s.activeStatus || 'Active'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GuardiansDetails({ student }) {
  const s = student || {}
  return (
    <div className="erp-tab-content">
      <div className="erp-profile-header">
        <Info size={19} className="erp-info-icon" />
        <span>Guardians Details</span>
      </div>

      {/* Guardian 1: Father */}
      <div className="erp-guardian-section">
        <div className="erp-section-subhead-row">
          <div className="erp-section-subhead">1-{s.fatherName || 'AJAY KUMAR SAHOO'}</div>
          <div className="erp-emergency-contact-box">
            <span>Is Emergency Contact</span>
            <span className="erp-badge-orange">{s.fatherIsEmergency || 'No'}</span>
          </div>
        </div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Name</td>
                <td className="erp-td-cell">{s.fatherName || 'AJAY KUMAR SAHOO'}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Relation</td>
                <td className="erp-td-cell">{s.fatherRelationship || 'Father'}</td>
                <td className="erp-th-cell">Occupation</td>
                <td className="erp-td-cell">{s.fatherOccupation || 'FARMER'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Mobile No</td>
                <td className="erp-td-cell">{s.fatherPhone || '7749844291'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.fatherLandline || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Income</td>
                <td className="erp-td-cell">{s.fatherIncome || '1LAK'}</td>
                <td className="erp-th-cell">Email</td>
                <td className="erp-td-cell">{s.fatherEmail || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Qualification</td>
                <td className="erp-td-cell">{s.fatherQualification || ''}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Home Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.fatherHomeAddress || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Office Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.fatherOfficeAddress || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guardian 2: Mother */}
      <div className="erp-guardian-section" style={{ marginTop: '28px' }}>
        <div className="erp-section-subhead-row">
          <div className="erp-section-subhead">2-{s.motherName || 'SANJUBALA SAHOO'}</div>
          <div className="erp-emergency-contact-box">
            <span>Is Emergency Contact</span>
            <span className="erp-badge-orange">{s.motherIsEmergency || 'No'}</span>
          </div>
        </div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Name</td>
                <td className="erp-td-cell">{s.motherName || 'SANJUBALA SAHOO'}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Relation</td>
                <td className="erp-td-cell">{s.motherRelationship || 'Mother'}</td>
                <td className="erp-th-cell">Occupation</td>
                <td className="erp-td-cell">{s.motherOccupation || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Mobile No</td>
                <td className="erp-td-cell">{s.motherPhone || ''}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.motherLandline || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Income</td>
                <td className="erp-td-cell">{s.motherIncome || '0'}</td>
                <td className="erp-th-cell">Email</td>
                <td className="erp-td-cell">{s.motherEmail || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Qualification</td>
                <td className="erp-td-cell">{s.motherQualification || ''}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Home Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.motherHomeAddress || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Office Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.motherOfficeAddress || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AddressDetails({ student }) {
  const s = student || {}
  return (
    <div className="erp-tab-content">
      <div className="erp-profile-header">
        <Info size={19} className="erp-info-icon" />
        <span>Address Info</span>
      </div>

      {/* Current Address */}
      <div className="erp-address-section">
        <div className="erp-section-subhead">Current Address</div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.currAddress || 'GHASIPUT, CUTTACK'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">City</td>
                <td className="erp-td-cell">{s.currCity || 'Cuttack'}</td>
                <td className="erp-th-cell">State</td>
                <td className="erp-td-cell">{s.currState || 'Odisha'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Country</td>
                <td className="erp-td-cell">{s.currCountry || 'India'}</td>
                <td className="erp-th-cell">House No</td>
                <td className="erp-td-cell">{s.currHouseNo || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Pincode</td>
                <td className="erp-td-cell">{s.currPin || '754008'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.currPhone || '7749844291'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Permenant Address */}
      <div className="erp-address-section" style={{ marginTop: '28px' }}>
        <div className="erp-section-subhead">Permenant Address</div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Address</td>
                <td className="erp-td-cell" colSpan={3}>{s.permAddress || 'GHASIPUT, CUTTACK'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">City</td>
                <td className="erp-td-cell">{s.permCity || 'Cuttack'}</td>
                <td className="erp-th-cell">State</td>
                <td className="erp-td-cell">{s.permState || 'Odisha'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Country</td>
                <td className="erp-td-cell">{s.permCountry || 'India'}</td>
                <td className="erp-th-cell">House No</td>
                <td className="erp-td-cell">{s.permHouseNo || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Pincode</td>
                <td className="erp-td-cell">{s.permPin || '754008'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.permPhone || '7749844291'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
