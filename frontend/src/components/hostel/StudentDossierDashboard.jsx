import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building,
  Bed,
  User,
  GraduationCap,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Phone,
  MapPin,
  ShieldCheck,
  Eye,
  Printer,
  Download,
  Award,
  AlertCircle,
  Calendar,
  Users,
  QrCode,
  IdCard,
  Mail,
  FileCheck,
  ExternalLink,
  Check,
  Sparkles,
  PhoneCall,
  X
} from 'lucide-react';
import { findStudentByQuery } from '../../services/studentStore.js';
import { getResidentLeavesByStudent } from '../../services/hostelResidentLeaveStore.js';
import './StudentDossierDashboard.css';

export default function StudentDossierDashboard({
  applicant,
  account,
  onBack,
  onUpdateStatus
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const isHostelAdmin = account?.role === 'hostel_admin' || account?.role === 'admin';

  // Merge applicant data with studentStore or generate rich realistic dossier fields
  const student = useMemo(() => {
    const matched = findStudentByQuery(applicant?.regNo || applicant?.rollNo || applicant?.studentName);
    const isFemale = applicant?.gender === 'Female';

    return {
      id: applicant?.id || 'HAPP-2026-001',
      applicationNo: applicant?.applicationNo || 'HAPP/2026/0142',
      studentName: applicant?.studentName || 'Tanmaya Kumar Das',
      firstName: (applicant?.studentName || '').split(' ')[0] || 'Tanmaya',
      lastName: (applicant?.studentName || '').split(' ').slice(1).join(' ') || 'Das',
      title: isFemale ? 'Ms.' : 'Mr.',
      gender: applicant?.gender || 'Male',
      regNo: applicant?.regNo || '2301105021',
      rollNo: applicant?.rollNo || '23CSE045',
      branch: applicant?.branch || 'Computer Science & Engineering',
      department: applicant?.branch || 'Computer Science & Engineering',
      deptCode: applicant?.branch?.includes('Computer') ? 'CSE' : applicant?.branch?.includes('Mechanical') ? 'ME' : 'ENGG',
      semester: applicant?.semester || 'Semester 3',
      currentSemester: 3,
      section: 'Section A',
      batch: 'BTECH 2024–2028',
      cgpa: applicant?.cgpa || '8.85',
      status: applicant?.status || 'Allotted',
      feeStatus: applicant?.feeStatus || 'Paid (₹38,000)',
      appliedDate: applicant?.appliedDate || '12-07-2026',
      allottedHostel: applicant?.allottedHostel || 'Bhabani Hostel-1',
      preferredHostel: applicant?.preferredHostel || 'Bhabani Hostel-1',
      roomNo: applicant?.roomNo || '101',
      bedNo: applicant?.bedNo || 'Bed 01',
      phone: applicant?.phone || '+91 94380 12345',
      email: `${(applicant?.studentName || 'student').toLowerCase().replace(/\s+/g, '.') + '@gift.edu.in'}`,
      personalEmail: `${(applicant?.studentName || 'student').toLowerCase().replace(/\s+/g, '.') + '@gmail.com'}`,
      guardianName: applicant?.guardianName || 'Bhuban Mohan Das',
      guardianPhone: applicant?.guardianPhone || '+91 94370 54321',
      motherName: isFemale ? 'Sujata Mohapatra' : 'Kalyani Das',
      motherPhone: '+91 94370 54329',
      guardianOccupation: 'Senior Government Officer',
      motherOccupation: 'High School Teacher',
      annualIncome: '₹ 8,50,000 / annum',
      homeCity: applicant?.homeCity || 'Rourkela, Sundargarh',
      distanceKm: applicant?.distanceKm || 340,
      permAddress: `Plot No. 45, Sector 4, ${applicant?.homeCity || 'Rourkela'}`,
      permState: 'Odisha',
      permPin: '769002',
      dob: '2005-05-15',
      dobFormatted: '15-05-2005',
      bloodGroup: 'B+',
      category: 'General',
      caste: 'General',
      religion: 'HINDU',
      nationality: 'Indian',
      thumbId: `GFT-${applicant?.regNo || '2301105021'}`,
      identificationMark: 'Small mole on right collarbone',
      languagesKnown: 'Odia, English, Hindi',
      hobbies: 'Coding, Badminton, Tech Blogging',
      academicAttendance: 94.2,
      hostelAttendance: 96.8,
      lastClassAttendance: '26/10/2026',
      lastHostelAttendance: '27/10/2026 (Night Roll Call - Present)',
      roomType: '2-Bedded Air-Cooled Room (Floor 1)',
      roommateName: 'Sourav Mohanty (Roll 05, Reg: 2305201005)',
      wardenName: 'Mr. Rajesh Jena',
      wardenContact: '+91 94370 12345',
      messPlan: 'Regular Non-Veg / Veg Dining Hall 1',
      gatePassHistory: [
        { id: 'GP-2026-104', type: 'Weekend Outstation', dest: 'Home (Rourkela)', outDate: '18-10-2026', inDate: '20-10-2026', status: 'Returned on Time' },
        { id: 'GP-2026-068', type: 'Local Market', dest: 'Infocity, Bhubaneswar', outDate: '10-10-2026', inDate: '10-10-2026', status: 'Completed' }
      ],
      qualifications: [
        { qualification: '10th (Matriculation)', institute: 'DAV Public School', board: 'CBSE', year: '2021', marks: '92.40%' },
        { qualification: '12th (Higher Secondary)', institute: 'Ispat Junior College', board: 'CHSE Odisha', year: '2023', marks: '88.60%' },
        { qualification: 'B.Tech Semester 1', institute: 'Gandhi Institute For Technology (BPUT)', board: 'BPUT', year: '2024', marks: '8.90 SGPA' },
        { qualification: 'B.Tech Semester 2', institute: 'Gandhi Institute For Technology (BPUT)', board: 'BPUT', year: '2024', marks: '8.80 SGPA' },
      ],
      ...(matched || {})
    };
  }, [applicant]);

  const studentLeaves = useMemo(() => {
    return getResidentLeavesByStudent(student.regNo || student.rollNo || student.studentName);
  }, [student]);

  const handleCallGuardian = () => {
    window.location.href = `tel:${student.guardianPhone}`;
  };

  const handleStatusChange = (newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(student.id, newStatus);
      showToast(`✓ Applicant status updated to "${newStatus}" and synchronized!`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Summary', icon: Building },
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'academic', label: 'Academic & Qualifications', icon: GraduationCap },
    { id: 'hostel', label: 'Hostel & Room Details', icon: Bed },
    { id: 'guardians', label: 'Guardians & Parents', icon: Users },
    { id: 'address', label: 'Contact & Addresses', icon: MapPin },
    { id: 'fees', label: 'Fees & Allotment Sanction', icon: CreditCard },
    { id: 'attendance', label: 'Attendance & Roll-Call', icon: CheckCircle2 },
    { id: 'health', label: 'Health & Medical', icon: Heart },
    { id: 'documents', label: 'Documents & ID Pass', icon: IdCard },
  ];

  return (
    <div className="student-dossier-dashboard">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="dossier-toast-banner">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Row */}
      <div className="dossier-top-nav">
        <div className="dossier-breadcrumb">
          <button type="button" onClick={onBack} className="crumb-btn">Hostel Portal</button>
          <span>/</span>
          <button type="button" onClick={onBack} className="crumb-btn">Applicant Registry</button>
          <span>/</span>
          <span className="crumb-current">{student.studentName} ({student.regNo})</span>
        </div>

        <div className="dossier-top-actions">
          <button type="button" className="dossier-btn back" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Applicants Registry</span>
          </button>

          <button type="button" className="dossier-btn print" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print Student Dossier</span>
          </button>

          <button type="button" className="dossier-btn call" onClick={handleCallGuardian}>
            <PhoneCall size={15} />
            <span>Call Guardian: {student.guardianPhone}</span>
          </button>
        </div>
      </div>

      {/* Student Identity Hero Header */}
      <div className="dossier-hero-card">
        <div className="dossier-hero-left">
          <div className="dossier-avatar-wrap">
            <div className="dossier-avatar-img">
              {student.studentName.charAt(0)}
            </div>
            <span className="dossier-online-dot" title="Active Campus Boarder"></span>
          </div>

          <div className="dossier-hero-info">
            <div className="hero-name-row">
              <h2>{student.studentName}</h2>
              <span className={`dossier-status-badge ${student.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {student.status === 'Allotted' ? '✓ Allotted Boarder' : student.status}
              </span>
              <span className="dossier-tag-cgpa">
                <Award size={13} /> {student.cgpa} CGPA
              </span>
            </div>

            <p className="hero-subtext">
              <strong>Reg No:</strong> {student.regNo} &nbsp;|&nbsp; 
              <strong>Roll No:</strong> {student.rollNo} &nbsp;|&nbsp;
              <strong>Application ID:</strong> <code>{student.applicationNo}</code>
            </p>

            <div className="hero-tags-row">
              <span className="hero-chip"><GraduationCap size={13} /> {student.branch} ({student.semester})</span>
              <span className="hero-chip"><Building size={13} /> {student.allottedHostel}</span>
              <span className="hero-chip room"><Bed size={13} /> Room {student.roomNo} · {student.bedNo}</span>
              <span className="hero-chip distance"><MapPin size={13} /> {student.homeCity} ({student.distanceKm} km away)</span>
            </div>
          </div>
        </div>

        {/* Hostel Admin Sanction Control Box */}
        <div className="dossier-hero-right">
          <div className="inspector-box">
            <div className="inspector-label">
              <ShieldCheck size={14} color="#15803d" />
              <span>Inspection View: <strong>{isHostelAdmin ? 'Hostel Admin' : 'Resident Warden'}</strong></span>
            </div>
            <div className="inspector-actions">
              <button
                type="button"
                className={`sanction-btn allot ${student.status === 'Allotted' ? 'active' : ''}`}
                onClick={() => handleStatusChange('Allotted')}
                title="Sanction bed allotment"
              >
                <Check size={13} /> Allot
              </button>
              <button
                type="button"
                className={`sanction-btn approve ${student.status === 'Approved' ? 'active' : ''}`}
                onClick={() => handleStatusChange('Approved')}
                title="Approve student dossier"
              >
                Approve
              </button>
              <button
                type="button"
                className={`sanction-btn waitlist ${student.status === 'Waitlisted' ? 'active' : ''}`}
                onClick={() => handleStatusChange('Waitlisted')}
                title="Place on waitlist"
              >
                Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Bar */}
      <div className="dossier-metrics-strip">
        <div className="metric-tile">
          <span className="tile-icon hostel"><Building size={18} /></span>
          <div>
            <div className="tile-title">Hostel &amp; Bed</div>
            <strong>{student.allottedHostel}</strong>
            <small>Room {student.roomNo} · {student.bedNo}</small>
          </div>
        </div>

        <div className="metric-tile">
          <span className="tile-icon attend"><CheckCircle2 size={18} /></span>
          <div>
            <div className="tile-title">Hostel Night Roll-Call</div>
            <strong style={{ color: '#15803d' }}>{student.hostelAttendance}% Verified</strong>
            <small>Academic: {student.academicAttendance}%</small>
          </div>
        </div>

        <div className="metric-tile">
          <span className="tile-icon fees"><CreditCard size={18} /></span>
          <div>
            <div className="tile-title">Hostel Fee Status</div>
            <strong style={{ color: '#047857' }}>{student.feeStatus}</strong>
            <small>Mess &amp; Amenities Cleared</small>
          </div>
        </div>

        <div className="metric-tile">
          <span className="tile-icon distance"><MapPin size={18} /></span>
          <div>
            <div className="tile-title">Home Distance</div>
            <strong>{student.distanceKm} km</strong>
            <small>{student.homeCity} (High Priority)</small>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="dossier-tabs-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`dossier-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents Area */}
      <div className="dossier-tab-content">
        {/* 1. OVERVIEW & SUMMARY */}
        {activeTab === 'overview' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              {/* Quick Profile Summary Card */}
              <div className="dossier-card">
                <div className="card-header">
                  <User size={18} color="#2563eb" />
                  <h4>Resident Student Profile Overview</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Full Legal Name:</span>
                    <strong>{student.title} {student.studentName}</strong>
                  </div>
                  <div className="info-item">
                    <span>University Reg No:</span>
                    <strong>{student.regNo}</strong>
                  </div>
                  <div className="info-item">
                    <span>Class Roll Number:</span>
                    <strong>{student.rollNo}</strong>
                  </div>
                  <div className="info-item">
                    <span>Degree &amp; Program:</span>
                    <strong>B.Tech ({student.branch})</strong>
                  </div>
                  <div className="info-item">
                    <span>Current Semester / Batch:</span>
                    <strong>{student.semester} · {student.batch}</strong>
                  </div>
                  <div className="info-item">
                    <span>Date of Birth / Age:</span>
                    <strong>{student.dobFormatted} (21 yrs)</strong>
                  </div>
                  <div className="info-item">
                    <span>Blood Group:</span>
                    <strong><span className="blood-pill">{student.bloodGroup}</span></strong>
                  </div>
                  <div className="info-item">
                    <span>Biometric Thumb ID:</span>
                    <code>{student.thumbId}</code>
                  </div>
                </div>
              </div>

              {/* Accommodation & Warden Overview */}
              <div className="dossier-card">
                <div className="card-header">
                  <Building size={18} color="#15803d" />
                  <h4>Boarding &amp; Room Allotment Status</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Assigned Residence:</span>
                    <strong>{student.allottedHostel}</strong>
                  </div>
                  <div className="info-item">
                    <span>Room &amp; Bed Number:</span>
                    <strong style={{ color: '#15803d' }}>Room {student.roomNo} ({student.bedNo})</strong>
                  </div>
                  <div className="info-item">
                    <span>Room Specification:</span>
                    <strong>{student.roomType}</strong>
                  </div>
                  <div className="info-item">
                    <span>Roommate Assigned:</span>
                    <strong>{student.roommateName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Supervising Warden:</span>
                    <strong>{student.wardenName} ({student.wardenContact})</strong>
                  </div>
                  <div className="info-item">
                    <span>Hostel Fee Status:</span>
                    <strong style={{ color: '#047857' }}>{student.feeStatus}</strong>
                  </div>
                  <div className="info-item">
                    <span>Mess Dining Option:</span>
                    <strong>{student.messPlan}</strong>
                  </div>
                  <div className="info-item">
                    <span>Last Roll-Call Verification:</span>
                    <strong style={{ color: '#166534' }}>{student.lastHostelAttendance}</strong>
                  </div>
                </div>
              </div>

              {/* Parent / Guardian Quick Contact Card */}
              <div className="dossier-card">
                <div className="card-header">
                  <Users size={18} color="#7c3aed" />
                  <h4>Parent &amp; Emergency Contact Snapshot</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Father / Primary Guardian:</span>
                    <strong>{student.guardianName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Father Phone:</span>
                    <strong>
                      <a href={`tel:${student.guardianPhone}`} style={{ color: '#2563eb' }}>
                        {student.guardianPhone}
                      </a>
                    </strong>
                  </div>
                  <div className="info-item">
                    <span>Mother's Name:</span>
                    <strong>{student.motherName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Mother's Phone:</span>
                    <strong>{student.motherPhone}</strong>
                  </div>
                  <div className="info-item">
                    <span>Guardian Occupation:</span>
                    <strong>{student.guardianOccupation}</strong>
                  </div>
                  <div className="info-item">
                    <span>Permanent Hometown:</span>
                    <strong>{student.homeCity} ({student.distanceKm} km from campus)</strong>
                  </div>
                </div>
              </div>

              {/* Recent Gate Pass Activity */}
              <div className="dossier-card">
                <div className="card-header">
                  <FileCheck size={18} color="#d97706" />
                  <h4>Recent Gate Pass &amp; Curfew Records</h4>
                </div>
                <div className="dossier-table-mini">
                  <table>
                    <thead>
                      <tr>
                        <th>Pass ID</th>
                        <th>Type</th>
                        <th>Destination</th>
                        <th>Out Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.gatePassHistory.map(gp => (
                        <tr key={gp.id}>
                          <td><code>{gp.id}</code></td>
                          <td>{gp.type}</td>
                          <td>{gp.dest}</td>
                          <td>{gp.outDate}</td>
                          <td><span className="tag-status-green">{gp.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="tab-pane-fade">
            <div className="dossier-card">
              <div className="card-header">
                <User size={18} color="#2563eb" />
                <h4>Comprehensive Personal Demographic Dossier</h4>
              </div>

              <div className="dossier-grid-3col">
                <div className="data-box">
                  <label>Title</label>
                  <span>{student.title}</span>
                </div>
                <div className="data-box">
                  <label>First Name</label>
                  <span>{student.firstName}</span>
                </div>
                <div className="data-box">
                  <label>Last Name</label>
                  <span>{student.lastName}</span>
                </div>
                <div className="data-box">
                  <label>Gender</label>
                  <span>{student.gender}</span>
                </div>
                <div className="data-box">
                  <label>Date of Birth</label>
                  <span>{student.dobFormatted}</span>
                </div>
                <div className="data-box">
                  <label>Blood Group</label>
                  <span className="blood-pill">{student.bloodGroup}</span>
                </div>
                <div className="data-box">
                  <label>Admission Category</label>
                  <span>{student.category}</span>
                </div>
                <div className="data-box">
                  <label>Caste / Social Group</label>
                  <span>{student.caste}</span>
                </div>
                <div className="data-box">
                  <label>Religion</label>
                  <span>{student.religion}</span>
                </div>
                <div className="data-box">
                  <label>Nationality</label>
                  <span>{student.nationality}</span>
                </div>
                <div className="data-box">
                  <label>Birthplace / Native Place</label>
                  <span>{student.homeCity}</span>
                </div>
                <div className="data-box">
                  <label>Biometric Thumb ID</label>
                  <code>{student.thumbId}</code>
                </div>
                <div className="data-box">
                  <label>Identification Mark</label>
                  <span>{student.identificationMark}</span>
                </div>
                <div className="data-box">
                  <label>Hostel Boarder</label>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>Yes (Allotted)</span>
                </div>
                <div className="data-box">
                  <label>College Transport</label>
                  <span>No (Hosteller)</span>
                </div>
                <div className="data-box">
                  <label>Lunch Scheme</label>
                  <span>Yes (Hostel Mess)</span>
                </div>
                <div className="data-box">
                  <label>NSS / NCC</label>
                  <span>Enrolled Volunteer</span>
                </div>
                <div className="data-box">
                  <label>Languages Known</label>
                  <span>{student.languagesKnown}</span>
                </div>
                <div className="data-box" style={{ gridColumn: 'span 3' }}>
                  <label>Hobbies &amp; Extracurriculars</label>
                  <span>{student.hobbies}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ACADEMIC & QUALIFICATIONS */}
        {activeTab === 'academic' && (
          <div className="tab-pane-fade">
            <div className="dossier-card" style={{ marginBottom: '1.25rem' }}>
              <div className="card-header">
                <GraduationCap size={18} color="#2563eb" />
                <h4>Current Academic Enrollment</h4>
              </div>
              <div className="dossier-grid-3col">
                <div className="data-box">
                  <label>Degree &amp; Course</label>
                  <span>Bachelor of Technology (B.Tech)</span>
                </div>
                <div className="data-box">
                  <label>Branch / Department</label>
                  <span>{student.branch}</span>
                </div>
                <div className="data-box">
                  <label>Current Semester</label>
                  <span>{student.semester}</span>
                </div>
                <div className="data-box">
                  <label>Academic Section</label>
                  <span>{student.section}</span>
                </div>
                <div className="data-box">
                  <label>Batch / Academic Year</label>
                  <span>{student.batch}</span>
                </div>
                <div className="data-box">
                  <label>Cumulative CGPA</label>
                  <span style={{ color: '#15803d', fontWeight: 800 }}>{student.cgpa} / 10.0</span>
                </div>
                <div className="data-box">
                  <label>Active Backlogs</label>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>0 (Clean Record)</span>
                </div>
                <div className="data-box">
                  <label>Admission Entrance Exam</label>
                  <span>JEE (Main) - 2023</span>
                </div>
                <div className="data-box">
                  <label>House Allotted</label>
                  <span>ANAND HOUSE</span>
                </div>
              </div>
            </div>

            {/* Educational Qualifications Table */}
            <div className="dossier-card">
              <div className="card-header">
                <Award size={18} color="#7c3aed" />
                <h4>Prior Educational Qualifications Registry</h4>
              </div>
              <div className="dossier-table-wrapper">
                <table className="dossier-custom-table">
                  <thead>
                    <tr>
                      <th>Qualification</th>
                      <th>School / College / Institute</th>
                      <th>Board / University</th>
                      <th>Passing Year</th>
                      <th>Marks / CGPA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.qualifications.map((q, idx) => (
                      <tr key={idx}>
                        <td><strong>{q.qualification}</strong></td>
                        <td>{q.institute}</td>
                        <td>{q.board}</td>
                        <td>{q.year}</td>
                        <td><span className="cgpa-badge">{q.marks}</span></td>
                        <td><span className="tag-status-green">Verified</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. HOSTEL & ROOM DETAILS */}
        {activeTab === 'hostel' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              <div className="dossier-card">
                <div className="card-header">
                  <Bed size={18} color="#15803d" />
                  <h4>Hostel Accommodation Specifics</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Hostel Residence:</span>
                    <strong>{student.allottedHostel}</strong>
                  </div>
                  <div className="info-item">
                    <span>Room Number:</span>
                    <strong style={{ fontSize: '1.05rem', color: '#15803d' }}>Room {student.roomNo}</strong>
                  </div>
                  <div className="info-item">
                    <span>Bed Number:</span>
                    <strong style={{ color: '#0369a1' }}>{student.bedNo}</strong>
                  </div>
                  <div className="info-item">
                    <span>Room Specification:</span>
                    <strong>{student.roomType}</strong>
                  </div>
                  <div className="info-item">
                    <span>Floor / Wing:</span>
                    <strong>Floor 1 · North Wing</strong>
                  </div>
                  <div className="info-item">
                    <span>Roommate Name:</span>
                    <strong>{student.roommateName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Resident Warden:</span>
                    <strong>{student.wardenName} ({student.wardenContact})</strong>
                  </div>
                  <div className="info-item">
                    <span>Application Date:</span>
                    <strong>{student.appliedDate}</strong>
                  </div>
                </div>
              </div>

              <div className="dossier-card">
                <div className="card-header">
                  <Clock size={18} color="#2563eb" />
                  <h4>Curfew &amp; Roll-Call Compliance</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Hostel Night Attendance:</span>
                    <strong style={{ color: '#15803d' }}>{student.hostelAttendance}% (Excellent)</strong>
                  </div>
                  <div className="info-item">
                    <span>Last Night Roll-Call:</span>
                    <strong>{student.lastHostelAttendance}</strong>
                  </div>
                  <div className="info-item">
                    <span>Curfew Violations Recorded:</span>
                    <strong style={{ color: '#15803d' }}>0 Violations</strong>
                  </div>
                  <div className="info-item">
                    <span>Gate Passes Granted:</span>
                    <strong>{student.gatePassHistory.length} Passes Approved</strong>
                  </div>
                  <div className="info-item">
                    <span>Disciplinary Infractions:</span>
                    <strong style={{ color: '#15803d' }}>None (Clean Conduct Record)</strong>
                  </div>
                  <div className="info-item">
                    <span>Dining Facility:</span>
                    <strong>{student.messPlan}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstation Leaves & Gate Pass History with Rejection Reasons */}
            <div className="dossier-card" style={{ marginTop: '1.25rem' }}>
              <div className="card-header">
                <Calendar size={18} color="#e11d48" />
                <h4>Overnight Leave Applications &amp; Warden Clearance Dossier</h4>
              </div>
              <div className="dossier-table-wrapper">
                <table className="dossier-custom-table">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Duration &amp; Dates</th>
                      <th>Purpose / Stated Reason</th>
                      <th>Guardian Verification</th>
                      <th>Warden Clearance &amp; Stated Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentLeaves.map(leave => (
                      <tr key={leave.id}>
                        <td>
                          <strong style={{ fontFamily: 'monospace', color: '#4338ca' }}>{leave.id}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Applied: {leave.appliedOn}</div>
                        </td>
                        <td>
                          <strong>{leave.startDate} → {leave.endDate}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#0369a1' }}>{leave.days} Days Total</div>
                        </td>
                        <td>{leave.reason}</td>
                        <td>
                          <div>{leave.guardianName} ({leave.guardianPhone})</div>
                          <small style={{ color: leave.guardianStatus?.includes('Disapproved') ? '#dc2626' : '#166534', fontWeight: 600 }}>
                            • {leave.guardianStatus}
                          </small>
                        </td>
                        <td>
                          {leave.status === 'Rejected' ? (
                            <div>
                              <span className="tag-status-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <X size={12} /> Rejected
                              </span>
                              <div style={{ marginTop: '4px', background: '#fef2f2', border: '1px solid #fecdd3', borderLeft: '3px solid #e11d48', borderRadius: '4px', padding: '4px 6px', fontSize: '0.74rem', color: '#881337' }}>
                                <strong>Reason Stated:</strong> "{leave.rejectionReason}"
                                <div style={{ fontSize: '0.68rem', color: '#be123c', marginTop: '2px' }}>
                                  By {leave.rejectedBy} · {leave.rejectedAt}
                                </div>
                              </div>
                            </div>
                          ) : leave.status === 'Approved' ? (
                            <div>
                              <span className="tag-status-green">✓ Approved</span>
                              <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                                {leave.returned ? 'Returned on time' : 'Currently Away'}
                              </div>
                            </div>
                          ) : (
                            <span className="tag-status-amber">⏳ Pending Review</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {studentLeaves.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                          No overnight leave applications on record for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. GUARDIANS & PARENTS */}
        {activeTab === 'guardians' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              <div className="dossier-card">
                <div className="card-header">
                  <Users size={18} color="#2563eb" />
                  <h4>Father / Primary Guardian Information</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Father's Full Name:</span>
                    <strong>{student.guardianName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Relationship:</span>
                    <strong>Father</strong>
                  </div>
                  <div className="info-item">
                    <span>Mobile Phone:</span>
                    <strong>
                      <a href={`tel:${student.guardianPhone}`} style={{ color: '#2563eb' }}>
                        {student.guardianPhone}
                      </a>
                    </strong>
                  </div>
                  <div className="info-item">
                    <span>Occupation / Profession:</span>
                    <strong>{student.guardianOccupation}</strong>
                  </div>
                  <div className="info-item">
                    <span>Annual Household Income:</span>
                    <strong>{student.annualIncome}</strong>
                  </div>
                  <div className="info-item">
                    <span>Primary Emergency Contact:</span>
                    <span className="tag-status-green">Yes (First Priority)</span>
                  </div>
                </div>
              </div>

              <div className="dossier-card">
                <div className="card-header">
                  <Users size={18} color="#7c3aed" />
                  <h4>Mother &amp; Local Guardian Information</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Mother's Full Name:</span>
                    <strong>{student.motherName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Relationship:</span>
                    <strong>Mother</strong>
                  </div>
                  <div className="info-item">
                    <span>Mobile Phone:</span>
                    <strong>{student.motherPhone}</strong>
                  </div>
                  <div className="info-item">
                    <span>Occupation:</span>
                    <strong>{student.motherOccupation}</strong>
                  </div>
                  <div className="info-item">
                    <span>Local Guardian in Campus City:</span>
                    <strong>Ranjan Mohanty (Uncle · Bhubaneswar)</strong>
                  </div>
                  <div className="info-item">
                    <span>Local Guardian Phone:</span>
                    <strong>+91 94371 99881</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONTACT & ADDRESSES */}
        {activeTab === 'address' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              <div className="dossier-card">
                <div className="card-header">
                  <MapPin size={18} color="#dc2626" />
                  <h4>Permanent Family Residence</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Address Line:</span>
                    <strong>{student.permAddress}</strong>
                  </div>
                  <div className="info-item">
                    <span>City / District:</span>
                    <strong>{student.homeCity}</strong>
                  </div>
                  <div className="info-item">
                    <span>State / Province:</span>
                    <strong>{student.permState}</strong>
                  </div>
                  <div className="info-item">
                    <span>PIN Code:</span>
                    <strong>{student.permPin}</strong>
                  </div>
                  <div className="info-item">
                    <span>Distance from Campus:</span>
                    <strong style={{ color: '#2563eb', fontSize: '1rem' }}>
                      {student.distanceKm} km (Verified for Hostel Allotment)
                    </strong>
                  </div>
                </div>
              </div>

              <div className="dossier-card">
                <div className="card-header">
                  <Phone size={18} color="#2563eb" />
                  <h4>Digital &amp; Telecommunication Details</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Student Mobile Phone:</span>
                    <strong>{student.phone}</strong>
                  </div>
                  <div className="info-item">
                    <span>Institutional Email:</span>
                    <strong>{student.email}</strong>
                  </div>
                  <div className="info-item">
                    <span>Personal Email:</span>
                    <strong>{student.personalEmail}</strong>
                  </div>
                  <div className="info-item">
                    <span>Campus Residence:</span>
                    <strong>{student.allottedHostel}, Room {student.roomNo}</strong>
                  </div>
                  <div className="info-item">
                    <span>Emergency Contact Priority:</span>
                    <strong>Father ({student.guardianPhone})</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. FEES & SANCTION */}
        {activeTab === 'fees' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              <div className="dossier-card">
                <div className="card-header">
                  <CreditCard size={18} color="#047857" />
                  <h4>Hostel Fee Ledger &amp; Clearance</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Hostel Room &amp; Amenities:</span>
                    <strong>₹ 24,000 / semester</strong>
                  </div>
                  <div className="info-item">
                    <span>Mess Diet Charges:</span>
                    <strong>₹ 14,000 / semester</strong>
                  </div>
                  <div className="info-item">
                    <span>Total Hostel Dues:</span>
                    <strong style={{ fontSize: '1.05rem' }}>₹ 38,000</strong>
                  </div>
                  <div className="info-item">
                    <span>Fee Payment Status:</span>
                    <strong style={{ color: '#15803d', fontSize: '1.05rem' }}>{student.feeStatus}</strong>
                  </div>
                  <div className="info-item">
                    <span>Payment Mode:</span>
                    <strong>State Bank of India (SB Collect / Challan)</strong>
                  </div>
                  <div className="info-item">
                    <span>Transaction Reference:</span>
                    <code>TXN-2026-HBN1-0428</code>
                  </div>
                </div>
              </div>

              <div className="dossier-card">
                <div className="card-header">
                  <ShieldCheck size={18} color="#2563eb" />
                  <h4>Hostel Administration Official Sanction</h4>
                </div>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.86rem', color: '#475569' }}>
                    As <strong>{isHostelAdmin ? 'Hostel Administrator' : 'Resident Warden'}</strong>, you have authority to approve or adjust this student's boarding status.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="dossier-btn-allot"
                      onClick={() => handleStatusChange('Allotted')}
                    >
                      <Check size={16} /> Sanction Full Allotment
                    </button>
                    <button
                      type="button"
                      className="dossier-btn-approve"
                      onClick={() => handleStatusChange('Approved')}
                    >
                      Approve Application
                    </button>
                    <button
                      type="button"
                      className="dossier-btn-waitlist"
                      onClick={() => handleStatusChange('Waitlisted')}
                    >
                      Move to Waitlist
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. ATTENDANCE & BIOMETRICS */}
        {activeTab === 'attendance' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              <div className="dossier-card">
                <div className="card-header">
                  <CheckCircle2 size={18} color="#15803d" />
                  <h4>Hostel Night Roll-Call Record</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Night Roll-Call Attendance:</span>
                    <strong style={{ color: '#15803d', fontSize: '1.1rem' }}>{student.hostelAttendance}%</strong>
                  </div>
                  <div className="info-item">
                    <span>Current Month Status:</span>
                    <strong>26 Days Present · 1 Day Approved Leave · 0 Absences</strong>
                  </div>
                  <div className="info-item">
                    <span>Last Roll-Call Verification:</span>
                    <strong>{student.lastHostelAttendance}</strong>
                  </div>
                  <div className="info-item">
                    <span>Warden Inspection Verification:</span>
                    <span className="tag-status-green">Verified by Mr. Rajesh Jena</span>
                  </div>
                </div>
              </div>

              <div className="dossier-card">
                <div className="card-header">
                  <GraduationCap size={18} color="#2563eb" />
                  <h4>Academic Class Attendance Record</h4>
                </div>
                <div className="card-table">
                  <div className="info-item">
                    <span>Overall Academic Attendance:</span>
                    <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{student.academicAttendance}%</strong>
                  </div>
                  <div className="info-item">
                    <span>Last Class Attendance Log:</span>
                    <strong>{student.lastClassAttendance}</strong>
                  </div>
                  <div className="info-item">
                    <span>Eligibility for End-Semester Exams:</span>
                    <span className="tag-status-green">Eligible (Above 75% threshold)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. HEALTH & MEDICAL */}
        {activeTab === 'health' && (
          <div className="tab-pane-fade">
            <div className="dossier-card">
              <div className="card-header">
                <Heart size={18} color="#dc2626" />
                <h4>Health &amp; Medical Clearance Dossier</h4>
              </div>
              <div className="dossier-grid-3col">
                <div className="data-box">
                  <label>Blood Group</label>
                  <span className="blood-pill">{student.bloodGroup}</span>
                </div>
                <div className="data-box">
                  <label>Known Allergies</label>
                  <span>None reported on medical file</span>
                </div>
                <div className="data-box">
                  <label>Chronic Medical Conditions</label>
                  <span>None</span>
                </div>
                <div className="data-box">
                  <label>Emergency Medical Contact</label>
                  <span>{student.guardianName} ({student.guardianPhone})</span>
                </div>
                <div className="data-box">
                  <label>Campus Clinic Status</label>
                  <span className="tag-status-green">Medically Cleared for Boarding</span>
                </div>
                <div className="data-box">
                  <label>Dietary Restrictions</label>
                  <span>Standard Diet (No Restrictions)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. DOCUMENTS & ID CARD */}
        {activeTab === 'documents' && (
          <div className="tab-pane-fade">
            <div className="dossier-grid-2col">
              {/* Document List */}
              <div className="dossier-card">
                <div className="card-header">
                  <FileText size={18} color="#2563eb" />
                  <h4>Official Student Documents on File</h4>
                </div>
                <div className="dossier-docs-list">
                  <div className="doc-row">
                    <FileCheck size={20} color="#15803d" />
                    <div>
                      <strong>Hostel Allotment Order ({student.allottedHostel})</strong>
                      <small>PDF · 1.2 MB · Verified by Hostel Office</small>
                    </div>
                    <button type="button" className="doc-view-btn" onClick={() => showToast('Opening Allotment Order...')}>
                      <Eye size={14} /> View
                    </button>
                  </div>

                  <div className="doc-row">
                    <FileCheck size={20} color="#15803d" />
                    <div>
                      <strong>10th Board Certificate &amp; Marksheet</strong>
                      <small>PDF · 850 KB · Verified Academic Record</small>
                    </div>
                    <button type="button" className="doc-view-btn" onClick={() => showToast('Opening 10th Certificate...')}>
                      <Eye size={14} /> View
                    </button>
                  </div>

                  <div className="doc-row">
                    <FileCheck size={20} color="#15803d" />
                    <div>
                      <strong>12th Science Council Marksheet</strong>
                      <small>PDF · 920 KB · Verified Academic Record</small>
                    </div>
                    <button type="button" className="doc-view-btn" onClick={() => showToast('Opening 12th Certificate...')}>
                      <Eye size={14} /> View
                    </button>
                  </div>

                  <div className="doc-row">
                    <FileCheck size={20} color="#15803d" />
                    <div>
                      <strong>Medical Fitness Certificate</strong>
                      <small>PDF · 410 KB · Issued by Registered Medical Officer</small>
                    </div>
                    <button type="button" className="doc-view-btn" onClick={() => showToast('Opening Medical Certificate...')}>
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              </div>

              {/* ID Card Preview */}
              <div className="dossier-card">
                <div className="card-header">
                  <IdCard size={18} color="#7c3aed" />
                  <h4>Hostel Resident Boarder Identity Pass</h4>
                </div>
                <div className="resident-id-card-preview">
                  <div className="id-card-header">
                    <div className="id-card-logo">GIFT AUTONOMOUS</div>
                    <div className="id-card-sub">HOSTEL RESIDENT IDENTITY CARD</div>
                  </div>
                  <div className="id-card-body">
                    <div className="id-avatar-box">
                      {student.studentName.charAt(0)}
                    </div>
                    <div className="id-details-box">
                      <h4>{student.studentName}</h4>
                      <p><strong>REG:</strong> {student.regNo}</p>
                      <p><strong>ROLL:</strong> {student.rollNo}</p>
                      <p><strong>HOSTEL:</strong> {student.allottedHostel}</p>
                      <p><strong>ROOM:</strong> {student.roomNo} &nbsp;|&nbsp; <strong>BED:</strong> {student.bedNo}</p>
                      <p><strong>PHONE:</strong> {student.phone}</p>
                    </div>
                  </div>
                  <div className="id-card-footer">
                    <span>SESSION 2024–2028 · RESIDENT BOARDER</span>
                    <button type="button" className="print-id-btn" onClick={() => window.print()}>
                      <Printer size={13} /> Print ID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
