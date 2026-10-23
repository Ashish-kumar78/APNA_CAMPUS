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
  const [profileRecord, setProfileRecord] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
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

  // The authenticated profile endpoint is the source of private student details.
  useEffect(() => {
    let active = true
    setProfileLoading(true)
    setProfileError('')
    api.getProfile()
      .then((response) => {
        if (!active) return
        if (!response?.success || !response.data) throw new Error('The server did not return a student profile.')
        setProfileRecord(response.data)
      })
      .catch((error) => {
        if (!active) return
        setProfileError(error.message || 'Student profile could not be loaded.')
      })
      .finally(() => { if (active) setProfileLoading(false) })
    return () => { active = false }
  }, [account?.id])

  const student = useMemo(() => {
    const record = profileRecord || {}
    const father = record.guardians?.find((guardian) => /father/i.test(guardian.relationship))
    const mother = record.guardians?.find((guardian) => /mother/i.test(guardian.relationship))
    const permanentAddress = record.addresses?.find((address) => address.type === 'Permanent')
    const currentAddress = record.addresses?.find((address) => address.type === 'Current')
    const nameParts = (record.name || account?.name || '').trim().split(/\s+/).filter(Boolean)
    return {
      ...(account || {}),
      ...record,
      firstName: record.firstName || nameParts[0],
      lastName: record.lastName || nameParts.slice(1).join(' '),
      course: record.programme?.name || record.course,
      fatherName: father?.name,
      fatherRelationship: father?.relationship,
      fatherPhone: father?.contactNumber,
      fatherEmail: father?.email,
      motherName: mother?.name,
      motherRelationship: mother?.relationship,
      motherPhone: mother?.contactNumber,
      motherEmail: mother?.email,
      permAddress: permanentAddress?.addressLine,
      permCity: permanentAddress?.city,
      permState: permanentAddress?.state,
      permCountry: permanentAddress?.country,
      permPin: permanentAddress?.pincode,
      currAddress: currentAddress?.addressLine,
      currCity: currentAddress?.city,
      currState: currentAddress?.state,
      currCountry: currentAddress?.country,
      currPin: currentAddress?.pincode,
    }
  }, [account, profileRecord])

  // Dynamic student documents list
  const studentDocs = useMemo(() => Array.isArray(student.documents) ? student.documents : [], [student.documents])

  const firstName = student.firstName || '—'
  const lastName = student.lastName || '—'
  const middleName = student.middleName || '—'
  const fullName = student.name || [firstName, middleName, lastName].filter((part) => part && part !== '—').join(' ') || '—'
  const regNumber = student.registrationNumber || account?.registrationNumber || '—'
  const summaryRows = [
    ['Last Date of Class Attendance', student.lastClassAttendanceDate || '—'],
    ['Last Date of Hostel Attendance', student.lastHostelAttendanceDate || '—'],
    ['Registration No.', regNumber],
    ['Serial No.', student.rollNumber || '—'],
    ['Name', fullName.toUpperCase()],
    ['Mentor', student.mentor || '—'],
    ['Course', student.course || '—'],
    ['Batch', student.batch || '—'],
    ['Branch', student.branch || student.department || '—'],
    ['Section', student.academicSection || student.section || '—'],
    ['Domain Email ID', student.email || '—'],
    ['Email ID', student.personalEmail || '—'],
    ['Mobile No.', student.phone || '—'],
    ['WhatsApp No.', student.phone || '—'],
    ['Aadhaar No.', student.govtIdNumber || '—'],
    ['Voter ID', 'Not provided'],
    ['PAN No.', 'Not provided'],
    ['Driving License No.', 'Not provided'],
    ['Passport No.', 'Not provided'],
  ]

  const details = {
    Personal: [
      [{ label: 'Admission Category', value: student.admissionCategory || '—', wide: true }],
      [{ label: 'Title', value: student.title || '—', wide: true }],
      [{ label: 'First Name', value: firstName }, { label: 'Last Name', value: lastName }],
      [{ label: 'Middle Name', value: student.middleName || '—' }, { label: 'Gender', value: student.gender || '—' }],
      [{ label: 'Date of Birth', value: student.dobFormatted || student.dob || '—' }, { label: 'Nationality', value: student.nationality || '—' }],
      [{ label: 'Caste', value: student.caste || '—' }, { label: 'Religion', value: student.religion || '—' }],
      [{ label: 'Blood Group', value: student.bloodGroup || '—' }, { label: 'Birthplace', value: student.birthplace || '—' }],
      [{ label: 'Identification Mark', value: student.identificationMark || '—', wide: true }],
      [{ label: 'Thumb ID', value: student.thumbId || '—', wide: true }],
      [{ label: 'Hostel', value: student.hostelName || student.hostel || '—' }, { label: 'Transport', value: student.transport || '—' }],
      [{ label: 'Lunch', value: student.lunch || '—' }, { label: 'NSS', value: student.nss || '—' }],
      [{ label: 'Languages Known', value: student.languagesKnown || '—', wide: true }],
      [{ label: 'Hobbies', value: student.hobbies || '—', wide: true }],
    ],
    Guardians: [
      [{ label: 'Father / Guardian', value: student.guardians?.find(g => /father/i.test(g.relationship))?.name || student.fatherName || '—' }, { label: 'Relationship', value: student.fatherRelationship || '—' }],
      [{ label: 'Contact Number', value: student.fatherPhone || student.guardians?.find(g => /father/i.test(g.relationship))?.contactNumber || '—' }, { label: 'Email', value: student.fatherEmail || '—' }],
      [{ label: 'Mother / Guardian', value: student.guardians?.find(g => /mother/i.test(g.relationship))?.name || student.motherName || '—' }, { label: 'Relationship', value: student.motherRelationship || '—' }],
      [{ label: 'Contact Number', value: student.motherPhone || student.guardians?.find(g => /mother/i.test(g.relationship))?.contactNumber || '—' }, { label: 'Email', value: student.motherEmail || '—' }],
    ],
    Address: [
      [{ label: 'Address Type', value: 'Permanent', wide: true }],
      [{ label: 'Address', value: student.permAddress || student.addresses?.find(a => a.type === 'Permanent')?.addressLine || '—', wide: true }],
      [{ label: 'City', value: student.permCity || student.addresses?.find(a => a.type === 'Permanent')?.city || '—' }, { label: 'State', value: student.permState || student.addresses?.find(a => a.type === 'Permanent')?.state || '—' }],
      [{ label: 'Country', value: student.permCountry || '—' }, { label: 'PIN Code', value: student.permPin || student.addresses?.find(a => a.type === 'Permanent')?.pincode || '—' }],
      [{ label: 'Address Type', value: 'Current', wide: true }],
      [{ label: 'Address', value: student.currAddress || student.addresses?.find(a => a.type === 'Current')?.addressLine || '—', wide: true }],
      [{ label: 'City', value: student.currCity || student.addresses?.find(a => a.type === 'Current')?.city || '—' }, { label: 'State', value: student.currState || student.addresses?.find(a => a.type === 'Current')?.state || '—' }],
    ],
    Health: [
      [{ label: 'Blood Group', value: student.bloodGroup || '—' }, { label: 'Known Allergies', value: student.allergies || '—' }],
      [{ label: 'Emergency Contact', value: student.guardians?.[0]?.name || '—' }, { label: 'Contact Number', value: student.guardians?.[0]?.contactNumber || '—' }],
      [{ label: 'Medical Notes', value: '—', wide: true }],
    ],
  }

  function selectQuickLink(label) {
    setActiveQuickView(label)
    setMessage('')
  }

  const studentPhoto = account?.photo || profileRecord?.photo || null

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

      {profileError && <div className="erp-alert-box" role="alert">{profileError} Profile details shown below may be incomplete.</div>}
      {profileLoading && <div className="erp-alert-box" role="status">Loading your saved profile…</div>}

      <section className="profile-overview-strip" aria-label="Student identity summary">
        <div className="profile-photo" style={{ padding: 0, overflow: 'hidden', border: '2px solid #ffffff' }}>
          {studentPhoto ? <img src={studentPhoto} alt={account?.name || 'Student'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={42} aria-label="No profile photo" />}
        </div>
        <div className="profile-overview-copy">
          <span className="profile-overview-label">STUDENT RECORD · {student.status || 'STATUS UNKNOWN'}</span>
          <h2>{account?.name || 'Student'}</h2>
          <p>{student.department || '—'}</p>
        </div>
        <div className="profile-overview-facts">
          <span>
            <small>Registration number</small>
            <strong>{account?.registrationNumber || '—'}</strong>
          </span>
          <span>
            <small>Program</small>
            <strong>{student.course || '—'}{student.batch ? ` · ${student.batch}` : ''}</strong>
          </span>
          <span>
            <small>Current section</small>
            <strong>{student.deptCode || '—'}{student.section ? ` · ${student.section}` : ''}</strong>
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
                        onClick={() => setMessage('Document upload is unavailable until protected file storage is configured.')}
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
                  {studentPhoto ? <img src={studentPhoto} alt={student.name || 'Student'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={42} aria-label="No profile photo" />}
                </span>
                <strong className="profile-id-name">{student.name}</strong>
                <span>Registration No. {student.registrationNumber}</span>
                <span>{student.course || '—'} · {student.deptCode || '—'} · {student.batch || '—'}</span>
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
          <div className="profile-extra-links"><span><Award size={13} />Academic records</span><span><CalendarDays size={13} />Academic records</span></div>
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
                {selectedDocView.document === 'Passport-size photograph' && studentPhoto ? (
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
                <div><span style={{ color: '#64748b', fontSize: '0.75rem' }}>Department / Batch</span><div><strong>{selectedDocView.student.deptCode || '—'} · {selectedDocView.student.batch || '—'}</strong></div></div>
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


    </section>
  )
}

function QuickRecordDetails({ view, onBack }) {
  return (
    <div className="profile-quick-record">
      <div className="profile-quick-record-heading">
        <p className="profile-status-message">No persisted {view} records are available in this profile view.</p>
        <button className="profile-return" type="button" onClick={onBack}><ArrowLeft size={13} />Back to profile</button>
      </div>
    </div>
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
                {s.admissionCategory || '—'}
              </td>
            </tr>
            <tr>
              <td className="erp-th-cell">Title</td>
              <td className="erp-td-cell" colSpan={3}>
                {s.title || '—'}
              </td>
            </tr>
            <tr>
              <td className="erp-th-cell">First Name</td>
              <td className="erp-td-cell">{s.firstName || '—'}</td>
              <td className="erp-th-cell">Last Name</td>
              <td className="erp-td-cell">{s.lastName || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Middle Name</td>
              <td className="erp-td-cell">{s.middleName || '—'}</td>
              <td className="erp-th-cell">Gender</td>
              <td className="erp-td-cell">{s.gender || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Date of Birth</td>
              <td className="erp-td-cell">{s.dobFormatted || s.dob || '—'}</td>
              <td className="erp-th-cell">Nationality</td>
              <td className="erp-td-cell">{s.nationality || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Caste</td>
              <td className="erp-td-cell">{s.caste || '—'}</td>
              <td className="erp-th-cell">Religion</td>
              <td className="erp-td-cell">{s.religion || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Bloodgroup</td>
              <td className="erp-td-cell">{s.bloodGroup || '—'}</td>
              <td className="erp-th-cell">Birthplace</td>
              <td className="erp-td-cell">{s.birthplace || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Identification Mark</td>
              <td className="erp-td-cell" colSpan={3}>{s.identificationMark || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Thumb ID</td>
              <td className="erp-td-cell" colSpan={3}>{s.thumbId || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Hostel</td>
              <td className="erp-td-cell">{s.hostelName || s.hostel || '—'}</td>
              <td className="erp-th-cell">Transport</td>
              <td className="erp-td-cell">{s.transport || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Lunch</td>
              <td className="erp-td-cell">{s.lunch || '—'}</td>
              <td className="erp-th-cell">NSS</td>
              <td className="erp-td-cell">{s.nss || '—'}</td>
            </tr>
            <tr>
              <td className="erp-th-cell">Languages Known</td>
              <td className="erp-td-cell" colSpan={3}>{s.languagesKnown || '—'}</td>
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
  const [enrollmentError, setEnrollmentError] = useState('')

  useEffect(() => {
    let isMounted = true
    const query = s.id || s.studentId || s.registrationNumber || s.rollNumber
    if (query) {
      setLoadingEnrollments(true)
      setEnrollmentError('')
      api.getStudentEnrollments(query)
        .then((res) => {
          if (!isMounted) return
          const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
          setEnrollments(rows)
        })
        .catch((error) => {
          if (isMounted) setEnrollmentError(error.message || 'Enrollment history could not be loaded.')
        })
        .finally(() => {
          if (isMounted) setLoadingEnrollments(false)
        })
    }
    return () => { isMounted = false }
  }, [s.registrationNumber, s.rollNumber, s.id])

  const displayEnrollments = enrollments

  const fields = [
    ['Course', s.course || '—'],
    ['Batch', s.batch || '—'],
    ['Branch', s.branch || s.department || '—'],
    ['Section', s.section || s.academicSection || '—'],
    ['House', s.house || '—'],
    ['Lab Group', s.labGroup || '1'],
    ['Honors', s.honors || 'N'],
    ['Minor', s.minor || 'N'],
    ['Value added course-1', s.valueAdded1 || ''],
    ['Value added course-2', s.valueAdded2 || ''],
    ['Value added course-3', s.valueAdded3 || ''],
    ['Admission Date', s.admissionDateFormatted || s.admissionDate || '—'],
    ['Entrance Examination', s.entranceExam || '—'],
    ['Rank', s.rank !== undefined ? String(s.rank) : '—'],
  ]

  const qualifications = [
    ['10th', s.qual10thInstitute || '—', s.qual10thYear || '—', s.qual10thMarks || '—'],
    ['12th', s.qual12thInstitute || '—', s.qual12thYear || '—', s.qual12thMarks || '—'],
    ['ITI', s.qualItiInstitute || '—', s.qualItiYear || '—', s.qualItiMarks || '—'],
    ['Diploma', s.qualDiplomaInstitute || '—', s.qualDiplomaYear || '—', s.qualDiplomaMarks || '—'],
    ['+3', s.qualPlus3Institute || '—', s.qualPlus3Year || '—', s.qualPlus3Marks || '—'],
    ['BCA', s.qualBcaInstitute || '—', s.qualBcaYear || '—', s.qualBcaMarks || '—'],
    ['BBA', s.qualBbaInstitute || '—', s.qualBbaYear || '—', s.qualBbaMarks || '—'],
    ['BTECH', s.qualBtechInstitute || '—', s.qualBtechYear || '—', s.qualBtechMarks || '—'],
  ]

  return (
    <div className="erp-tab-content">
      <div className="erp-profile-header">
        <Info size={19} className="erp-info-icon" />
        <span>Academic Details</span>
      </div>
      <div className="erp-cyan-divider-bar"></div>


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
                  <td>{enr.programme?.name || s.department || '—'}</td>
                  <td>{enr.academicYear}</td>
                  <td>{enr.section || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{enr.sgpa ? Number(enr.sgpa).toFixed(2) : '—'}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{enr.cgpa != null ? Number(enr.cgpa).toFixed(2) : (s.cgpa ?? '—')}</td>
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
              {!loadingEnrollments && displayEnrollments.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>{enrollmentError || 'No persisted enrollment history is available.'}</td></tr>
              )}
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
          <div className="erp-section-subhead">1-{s.fatherName || '—'}</div>
          <div className="erp-emergency-contact-box">
            <span>Is Emergency Contact</span>
            <span className="erp-badge-orange">{s.fatherIsEmergency || '—'}</span>
          </div>
        </div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Name</td>
                <td className="erp-td-cell">{s.fatherName || '—'}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Relation</td>
                <td className="erp-td-cell">{s.fatherRelationship || '—'}</td>
                <td className="erp-th-cell">Occupation</td>
                <td className="erp-td-cell">{s.fatherOccupation || '—'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Mobile No</td>
                <td className="erp-td-cell">{s.fatherPhone || '7749844291'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.fatherLandline || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Income</td>
                <td className="erp-td-cell">{s.fatherIncome || '—'}</td>
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
          <div className="erp-section-subhead">2-{s.motherName || '—'}</div>
          <div className="erp-emergency-contact-box">
            <span>Is Emergency Contact</span>
            <span className="erp-badge-orange">{s.motherIsEmergency || '—'}</span>
          </div>
        </div>
        <div className="erp-gold-divider-line"></div>

        <div className="erp-table-responsive">
          <table className="erp-grid-table">
            <tbody>
              <tr>
                <td className="erp-th-cell">Name</td>
                <td className="erp-td-cell">{s.motherName || '—'}</td>
                <td className="erp-th-cell"></td>
                <td className="erp-td-cell"></td>
              </tr>
              <tr>
                <td className="erp-th-cell">Relation</td>
                <td className="erp-td-cell">{s.motherRelationship || '—'}</td>
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
                <td className="erp-td-cell">{s.motherIncome || '—'}</td>
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
                <td className="erp-td-cell" colSpan={3}>{s.currAddress || '—'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">City</td>
                <td className="erp-td-cell">{s.currCity || '—'}</td>
                <td className="erp-th-cell">State</td>
                <td className="erp-td-cell">{s.currState || '—'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Country</td>
                <td className="erp-td-cell">{s.currCountry || '—'}</td>
                <td className="erp-th-cell">House No</td>
                <td className="erp-td-cell">{s.currHouseNo || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Pincode</td>
                <td className="erp-td-cell">{s.currPin || '—'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.currPhone || '—'}</td>
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
                <td className="erp-td-cell" colSpan={3}>{s.permAddress || '—'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">City</td>
                <td className="erp-td-cell">{s.permCity || '—'}</td>
                <td className="erp-th-cell">State</td>
                <td className="erp-td-cell">{s.permState || '—'}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Country</td>
                <td className="erp-td-cell">{s.permCountry || '—'}</td>
                <td className="erp-th-cell">House No</td>
                <td className="erp-td-cell">{s.permHouseNo || ''}</td>
              </tr>
              <tr>
                <td className="erp-th-cell">Pincode</td>
                <td className="erp-td-cell">{s.permPin || '—'}</td>
                <td className="erp-th-cell">Phone No</td>
                <td className="erp-td-cell">{s.permPhone || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
