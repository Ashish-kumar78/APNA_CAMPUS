import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Send,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  User,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  QrCode,
  Printer,
  X,
  Eye,
  FileCheck,
  Phone,
  Sparkles,
  Download
} from 'lucide-react';
import './StudentGatePassSection.css';
import HandwrittenApplicationLetter from './HandwrittenApplicationLetter.jsx';
import {
  getAllGatePasses,
  getStudentGatePasses,
  createGatePass
} from '../services/gatePassStore.js';
import { getActiveStudent } from '../services/studentStore.js';

export default function StudentGatePassSection({ student: propStudent }) {
  const currentStudent = propStudent || getActiveStudent();
  const [gatePasses, setGatePasses] = useState([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDigitalPass, setSelectedDigitalPass] = useState(null);
  const [viewDocModal, setViewDocModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  // Custom purpose & custom room manual entries
  const [customPurpose, setCustomPurpose] = useState('');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomNumber, setCustomRoomNumber] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    hostelName: 'Gandhi Boys Residence (Hostel 1)',
    roomNumber: 'Room 101',
    bedNo: 'Bed 01',
    purposeType: 'Home Visit',
    destination: 'Plot 18, Unit 4, Bhubaneswar / Bargarh, Odisha',
    outDateTime: '2026-10-08T09:00',
    inDateTime: '2026-10-12T18:00',
    emergencyContact: currentStudent?.fatherPhone || '+91 94370 10001',
    mentorName: 'Dr. Siba Prasad Tripathy',
    mentorEmpId: 'FAC-CSE-018',
    mentorDepartment: 'Computer Science & Engineering',
    mentorVerified: true,
    mentorRemarks: 'Student has 92% attendance and completed mid-sem exams. Recommended for festival leave.',
    uploadedFile: {
      fileName: 'Rakesh_Das_Mentor_Verified_Leave_Application.pdf',
      fileType: 'application/pdf',
      fileSize: '340 KB',
      uploadedAt: 'Today',
      docTitle: 'Application for Home Leave with Mentor Recommendation',
      applicationText: `To\nThe Resident Warden\nGandhi Boys Residence (Hostel 1)\nApna Campus, Bhubaneswar\n\nRespected Sir,\n\nI am ${currentStudent?.name || 'Rakesh Das'}, a resident of Room 101 (Bed 01) pursuing B.Tech in ${currentStudent?.department || 'Computer Science & Engineering'} (5th Semester, Roll No: ${currentStudent?.rollNumber || '01'}, Reg No: ${currentStudent?.registrationNumber || '2305201001'}).\n\nI humbly request permission to visit my home from 08-Oct-2026 to 12-Oct-2026 for the upcoming festival. My academic mentor has verified my attendance (92%) and academic clearance.\n\nKindly issue the official Gate Pass for outstation travel.\n\nYours obediently,\n${currentStudent?.name || 'Rakesh Das'}\n\n[MENTOR ENDORSEMENT]\nStatus: Verified and Recommended\nSigned: Dr. Siba Prasad Tripathy (Faculty Advisor, Dept of CSE)`
    }
  });

  const loadPasses = () => {
    const studentId = currentStudent?.id || currentStudent?.registrationNumber || 'std-1';
    const passes = getStudentGatePasses(studentId);
    setGatePasses(passes);
  };

  useEffect(() => {
    loadPasses();
    const handleSync = () => loadPasses();
    window.addEventListener('bput_gate_passes_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bput_gate_passes_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentStudent]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setFormData(prev => ({
      ...prev,
      uploadedFile: {
        fileName: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: fileSizeFormatted,
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        docTitle: file.name.replace(/\.[^/.]+$/, ""),
        applicationText: `Uploaded student application document verified by academic mentor: ${prev.mentorName}.\nFile attached: ${file.name} (${fileSizeFormatted})`
      }
    }));
  };

  const handleGenerateTemplate = () => {
    const effectivePurpose = formData.purposeType === 'Other' ? (customPurpose.trim() || 'Other Personal Purpose') : formData.purposeType;
    const effectiveRoom = isCustomRoom && customRoomNumber.trim() ? customRoomNumber.trim() : formData.roomNumber;

    setFormData(prev => ({
      ...prev,
      uploadedFile: {
        fileName: `${(currentStudent?.name || 'Student').replace(/\s+/g, '_')}_Mentor_Endorsed_GatePass.pdf`,
        fileType: 'application/pdf',
        fileSize: '310 KB',
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        docTitle: `Verified Gate Pass Application · ${currentStudent?.name || 'Rakesh Das'}`,
        applicationText: `To\nThe Resident Warden\n${formData.hostelName}\nApna Campus, Bhubaneswar\n\nRespected Warden Sir / Madam,\n\nI am ${currentStudent?.name || 'Rakesh Das'} (Roll No: ${currentStudent?.rollNumber || '01'}, Reg No: ${currentStudent?.registrationNumber || '2305201001'}, ${currentStudent?.department || 'CSE'}, ${currentStudent?.semester || 'Semester 5'}).\n\nI request an outstation gate pass to travel to ${formData.destination} for ${effectivePurpose}.\nDeparture: ${formData.outDateTime.replace('T', ' ')}\nExpected Return: ${formData.inDateTime.replace('T', ' ')}\nParent / Guardian Contact: ${formData.emergencyContact}\n\n[MENTOR CLEARANCE]\nI have verified that the student has fulfilled attendance norms and completed scheduled academic assessments.\nMentor: ${formData.mentorName} (${formData.mentorEmpId})\nStatus: VERIFIED & RECOMMENDED\nDate: ${new Date().toLocaleDateString('en-IN')}`
      }
    }));
    showToast('Auto-generated formal application with Mentor Endorsement!');
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!formData.uploadedFile) {
      alert('Please upload or generate the mentor-verified application document.');
      return;
    }

    const effectivePurpose = formData.purposeType === 'Other' ? (customPurpose.trim() || 'Other Personal Purpose') : formData.purposeType;
    const effectiveRoom = isCustomRoom && customRoomNumber.trim() ? customRoomNumber.trim() : formData.roomNumber;

    const newPass = createGatePass({
      studentId: currentStudent?.id || 'std-1',
      studentName: currentStudent?.name || 'Rakesh Das',
      rollNumber: currentStudent?.rollNumber || '01',
      registrationNumber: currentStudent?.registrationNumber || '2305201001',
      department: currentStudent?.department || 'Computer Science & Engineering',
      semester: currentStudent?.semester || 'Semester 5',
      gender: currentStudent?.gender || 'Male',
      studentPhone: currentStudent?.phone || '+91 98610 23010',
      parentName: currentStudent?.fatherName || 'Sanjay Das',
      parentPhone: currentStudent?.fatherPhone || '+91 94370 10001',
      hostelName: formData.hostelName,
      roomNumber: effectiveRoom,
      bedNo: formData.bedNo,
      purposeType: effectivePurpose,
      destination: formData.destination,
      outDateTime: formData.outDateTime,
      inDateTime: formData.inDateTime,
      emergencyContact: formData.emergencyContact,
      parentConsentVerified: true,
      mentorName: formData.mentorName,
      mentorEmpId: formData.mentorEmpId,
      mentorDepartment: formData.mentorDepartment,
      mentorStatus: 'Verified & Recommended',
      mentorRemarks: formData.mentorRemarks,
      mentorVerifiedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      uploadedApplicationDoc: formData.uploadedFile
    });

    setIsApplyModalOpen(false);
    loadPasses();
    showToast(`✓ Gate Pass application ${newPass.id} submitted! It is automatically forwarded to the Hostel Warden for clearance.`);
  };

  const pendingCount = gatePasses.filter(p => p.status === 'Pending Warden Approval').length;
  const approvedCount = gatePasses.filter(p => p.status === 'Approved').length;

  return (
    <div className="gate-pass-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderLeft: '4px solid #22c55e',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="gate-pass-hero">
        <div className="gate-pass-hero-text">
          <h2>
            <ShieldCheck size={28} /> Hostel Resident Gate Pass Portal
          </h2>
          <p>
            Apply for Outstation, Home Visit, or Day Outing Gate Passes. Upload your
            <strong> mentor-verified application</strong> with your designated hostel details. 
            Once submitted, your application is automatically forwarded to the <strong>Hostel Warden</strong> for instant digital clearance.
          </p>
        </div>
        <button
          className="gate-pass-apply-hero-btn"
          onClick={() => setIsApplyModalOpen(true)}
        >
          <Plus size={18} /> Apply for New Gate Pass
        </button>
      </div>

      {/* Stats Counter */}
      <div className="gate-pass-stats-grid">
        <div className="gate-pass-stat-card">
          <div className="gate-pass-stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="gate-pass-stat-value">{gatePasses.length}</div>
            <div className="gate-pass-stat-label">Total Applications</div>
          </div>
        </div>

        <div className="gate-pass-stat-card">
          <div className="gate-pass-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="gate-pass-stat-value">{pendingCount}</div>
            <div className="gate-pass-stat-label">Pending Warden Clearance</div>
          </div>
        </div>

        <div className="gate-pass-stat-card">
          <div className="gate-pass-stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="gate-pass-stat-value">{approvedCount}</div>
            <div className="gate-pass-stat-label">Approved &amp; Ready</div>
          </div>
        </div>

        <div className="gate-pass-stat-card">
          <div className="gate-pass-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Building size={24} />
          </div>
          <div>
            <div className="gate-pass-stat-value" style={{ fontSize: '1rem', fontWeight: 700 }}>Gandhi Residence</div>
            <div className="gate-pass-stat-label">Assigned Hostel (Room 101)</div>
          </div>
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="gate-pass-section-card">
        <div className="gate-pass-section-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>
              My Outstation Gate Pass History
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Real-time synchronization with the Hostel Warden's desk and Campus Security Biometric Turnstiles.
            </p>
          </div>
          <button
            className="admin-action-btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
            onClick={() => setIsApplyModalOpen(true)}
          >
            <Plus size={15} /> Apply New Pass
          </button>
        </div>

        <div className="gate-pass-table-responsive">
          <table className="gate-pass-table">
            <thead>
              <tr>
                <th>Gate Pass ID</th>
                <th>Hostel &amp; Room</th>
                <th>Destination / Purpose</th>
                <th>Departure &amp; Return</th>
                <th>Mentor Verification</th>
                <th>Application Document</th>
                <th>Warden Clearance</th>
                <th style={{ textAlign: 'right' }}>Pass Actions</th>
              </tr>
            </thead>
            <tbody>
              {gatePasses.map(pass => {
                const isApproved = pass.status === 'Approved';
                const isPending = pass.status === 'Pending Warden Approval';
                const isRejected = pass.status === 'Rejected';

                return (
                  <tr key={pass.id}>
                    <td>
                      <strong style={{ color: '#4338ca', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                        {pass.id}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{pass.appliedAt}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{pass.hostelName}</div>
                      <small style={{ color: '#64748b' }}>{pass.roomNumber} · {pass.bedNo}</small>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{pass.purposeType}</div>
                      <small style={{ color: '#64748b', display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pass.destination}
                      </small>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>Out:</span> <strong>{pass.outDateTime ? pass.outDateTime.replace('T', ' ') : 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>In:</span> <strong>{pass.inDateTime ? pass.inDateTime.replace('T', ' ') : 'N/A'}</strong>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={12} /> {pass.mentorStatus || 'Verified'}
                      </span>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        {pass.mentorName}
                      </div>
                    </td>

                    <td>
                      {pass.uploadedApplicationDoc ? (
                        <button
                          type="button"
                          className="gp-doc-badge"
                          onClick={() => setViewDocModal({ ...pass.uploadedApplicationDoc, passRef: pass })}
                          title="Click to view handwritten application"
                        >
                          <FileText size={13} style={{ color: '#4338ca' }} />
                          <span>{pass.uploadedApplicationDoc.fileName}</span>
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>No document</span>
                      )}
                    </td>

                    <td>
                      {isApproved && (
                        <div>
                          <span className="gp-badge gp-badge-approved">
                            <CheckCircle2 size={12} /> Approved by Warden
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                            {pass.approvedBy} ({pass.approvedAt})
                          </div>
                        </div>
                      )}
                      {isPending && (
                        <div>
                          <span className="gp-badge gp-badge-pending">
                            <Clock size={12} /> Pending Warden Approval
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>
                            Awaiting Warden review
                          </div>
                        </div>
                      )}
                      {isRejected && (
                        <span className="gp-badge gp-badge-rejected">
                          <XCircle size={12} /> Rejected by Warden
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {isApproved ? (
                        <button
                          type="button"
                          className="admin-action-btn-primary"
                          style={{
                            background: '#16a34a',
                            fontSize: '0.78rem',
                            padding: '0.4rem 0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          onClick={() => setSelectedDigitalPass(pass)}
                        >
                          <QrCode size={14} /> View Official Pass
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-action-btn-secondary"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                          onClick={() => {
                            if (pass.uploadedApplicationDoc) {
                              setViewDocModal({ ...pass.uploadedApplicationDoc, passRef: pass });
                            } else {
                              showToast(`Gate Pass ${pass.id} is pending verification at the Warden's desk.`);
                            }
                          }}
                        >
                          <Eye size={13} /> View Status
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {gatePasses.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <ShieldCheck size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No gate passes applied yet.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}>Click "Apply for New Gate Pass" above to submit your outstation request.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL 1: APPLY FOR GATE PASS ── */}
      {isApplyModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsApplyModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '720px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} style={{ color: '#4338ca' }} /> Apply for Outstation / Home Gate Pass
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Provide your designated hostel, reason, mentor endorsement, and upload the signed application for Warden clearance.
                </p>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setIsApplyModalOpen(false)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="admin-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 1. Student Particulars Banner */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Resident Student</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentStudent?.name || 'Rakesh Das'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll &amp; Reg No</span>
                    <div style={{ fontWeight: 600, color: '#4338ca' }}>
                      Roll {currentStudent?.rollNumber || '01'} · Reg {currentStudent?.registrationNumber || '2305201001'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Department &amp; Sem</span>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      {currentStudent?.department || 'CSE'} ({currentStudent?.semester || 'Semester 5'})
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Student Mobile</span>
                    <div style={{ fontWeight: 600, color: '#334155' }}>
                      {currentStudent?.phone || '+91 98610 23010'}
                    </div>
                  </div>
                </div>

                {/* 2. Hostel Details (Required: mention hostel name) */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={15} /> 1. Resident Hostel Accommodation Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Designated Hostel Residence *</label>
                      <select
                        className="admin-form-select"
                        value={formData.hostelName}
                        onChange={e => setFormData({ ...formData, hostelName: e.target.value })}
                        required
                        style={{ fontWeight: 600 }}
                      >
                        <option value="Gandhi Boys Residence (Hostel 1)">Gandhi Boys Residence (Hostel 1)</option>
                        <option value="Kalam Boys Residence (Hostel 2)">Kalam Boys Residence (Hostel 2)</option>
                        <option value="Sarojini Girls Residence (Hostel 1)">Sarojini Girls Residence (Hostel 1)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Room Number (Select) *</label>
                      <select
                        className="admin-form-select"
                        value={isCustomRoom ? 'OTHER' : formData.roomNumber}
                        onChange={e => {
                          if (e.target.value === 'OTHER') {
                            setIsCustomRoom(true);
                          } else {
                            setIsCustomRoom(false);
                            setFormData({ ...formData, roomNumber: e.target.value });
                          }
                        }}
                        required
                        style={{ fontWeight: 600 }}
                      >
                        <optgroup label="1st Floor">
                          <option value="Room 101">Room 101 (1st Floor)</option>
                          <option value="Room 102">Room 102 (1st Floor)</option>
                          <option value="Room 103">Room 103 (1st Floor)</option>
                          <option value="Room 104">Room 104 (1st Floor)</option>
                          <option value="Room 105">Room 105 (1st Floor)</option>
                          <option value="Room 106">Room 106 (1st Floor)</option>
                          <option value="Room 107">Room 107 (1st Floor)</option>
                          <option value="Room 108">Room 108 (1st Floor)</option>
                        </optgroup>
                        <optgroup label="2nd Floor">
                          <option value="Room 201">Room 201 (2nd Floor)</option>
                          <option value="Room 202">Room 202 (2nd Floor)</option>
                          <option value="Room 203">Room 203 (2nd Floor)</option>
                          <option value="Room 204">Room 204 (2nd Floor)</option>
                          <option value="Room 205">Room 205 (2nd Floor)</option>
                          <option value="Room 206">Room 206 (2nd Floor)</option>
                          <option value="Room 207">Room 207 (2nd Floor)</option>
                          <option value="Room 208">Room 208 (2nd Floor)</option>
                        </optgroup>
                        <optgroup label="3rd Floor">
                          <option value="Room 301">Room 301 (3rd Floor)</option>
                          <option value="Room 302">Room 302 (3rd Floor)</option>
                          <option value="Room 303">Room 303 (3rd Floor)</option>
                          <option value="Room 304">Room 304 (3rd Floor)</option>
                          <option value="Room 305">Room 305 (3rd Floor)</option>
                          <option value="Room 306">Room 306 (3rd Floor)</option>
                          <option value="Room 307">Room 307 (3rd Floor)</option>
                          <option value="Room 308">Room 308 (3rd Floor)</option>
                        </optgroup>
                        <optgroup label="Custom / Other Room">
                          <option value="OTHER">Other Room Number (Type Manually)...</option>
                        </optgroup>
                      </select>
                      {isCustomRoom && (
                        <input
                          type="text"
                          className="admin-form-input"
                          placeholder="e.g. Room 405"
                          value={customRoomNumber}
                          onChange={e => {
                            setCustomRoomNumber(e.target.value);
                            setFormData({ ...formData, roomNumber: e.target.value });
                          }}
                          style={{ marginTop: '5px' }}
                          required
                        />
                      )}
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e3a8a' }}>Bed No (Select) *</label>
                      <select
                        className="admin-form-select"
                        value={formData.bedNo}
                        onChange={e => setFormData({ ...formData, bedNo: e.target.value })}
                        required
                        style={{ fontWeight: 600 }}
                      >
                        <option value="Bed 01">Bed 01</option>
                        <option value="Bed 02">Bed 02</option>
                        <option value="Bed 03">Bed 03</option>
                        <option value="Bed 04">Bed 04</option>
                        <option value="Bed 05">Bed 05 (Additional)</option>
                        <option value="Bed 06">Bed 06 (Additional)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Outstation Travel Details */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} /> 2. Outstation Travel &amp; Purpose
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Purpose of Visit *</label>
                      <select
                        className="admin-form-select"
                        value={formData.purposeType}
                        onChange={e => setFormData({ ...formData, purposeType: e.target.value })}
                        required
                        style={{ fontWeight: 600 }}
                      >
                        <option value="Home Visit">Home Visit / Family Vacation</option>
                        <option value="Medical Consultation">Medical Consultation / Hospital</option>
                        <option value="Competitive Examination">Competitive Examination / GATE / CAT</option>
                        <option value="Placement Drive">Off-Campus Placement / Internship</option>
                        <option value="Family Function">Family Event / Emergency</option>
                        <option value="Other">Other (Specify Manually)...</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Destination Full Address *</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={formData.destination}
                        onChange={e => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="e.g. Plot 18, Unit 4, Bhubaneswar / Bargarh, Odisha"
                        required
                      />
                    </div>

                    {formData.purposeType === 'Other' && (
                      <div className="admin-form-group" style={{ gridColumn: '1 / -1', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem', borderRadius: '8px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>
                          ✍️ Specify Custom Purpose of Visit (Manual Entry) *
                        </label>
                        <input
                          type="text"
                          className="admin-form-input"
                          placeholder="e.g. Attending Sister's Marriage, Passport Verification, Urgent Family Work"
                          value={customPurpose}
                          onChange={e => setCustomPurpose(e.target.value)}
                          required={formData.purposeType === 'Other'}
                          style={{ background: '#ffffff', fontWeight: 600 }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Departure Date &amp; Time *</label>
                      <input
                        type="datetime-local"
                        className="admin-form-input"
                        value={formData.outDateTime}
                        onChange={e => setFormData({ ...formData, outDateTime: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Expected Return Date &amp; Time *</label>
                      <input
                        type="datetime-local"
                        className="admin-form-input"
                        value={formData.inDateTime}
                        onChange={e => setFormData({ ...formData, inDateTime: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Parent / Guardian Phone *</label>
                      <input
                        type="tel"
                        className="admin-form-input"
                        value={formData.emergencyContact}
                        onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Mentor Verification Section */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={16} /> 3. Academic Mentor Verification &amp; Endorsement
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>Faculty Mentor Name *</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={formData.mentorName}
                        onChange={e => setFormData({ ...formData, mentorName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>Mentor Employee ID</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={formData.mentorEmpId}
                        onChange={e => setFormData({ ...formData, mentorEmpId: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>Mentor Recommendation Remark</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.mentorRemarks}
                      onChange={e => setFormData({ ...formData, mentorRemarks: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dcfce7', padding: '8px 12px', borderRadius: '8px' }}>
                    <input
                      type="checkbox"
                      id="mentorVerifyCheck"
                      checked={formData.mentorVerified}
                      onChange={e => setFormData({ ...formData, mentorVerified: e.target.checked })}
                      required
                    />
                    <label htmlFor="mentorVerifyCheck" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', cursor: 'pointer', margin: 0 }}>
                      ✓ I certify that my Faculty Mentor has endorsed and approved this outstation leave application.
                    </label>
                  </div>
                </div>

                {/* 5. Upload Application Document */}
                <div style={{ background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={16} /> 4. Upload Application Verified from Mentor *
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '3px 8px', color: '#7c3aed', borderColor: '#ddd6fe', background: '#ffffff' }}
                      onClick={handleGenerateTemplate}
                    >
                      <Sparkles size={12} /> Auto-Generate Mentor Signed Application
                    </button>
                  </div>

                  <div style={{
                    border: '2px dashed #c084fc',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      id="gatePassDocUpload"
                    />

                    {formData.uploadedFile ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '8px 16px', borderRadius: '8px' }}>
                        <FileText size={22} style={{ color: '#7c3aed' }} />
                        <div style={{ textAlign: 'left' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>
                            {formData.uploadedFile.fileName}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {formData.uploadedFile.fileSize} · Verified Mentor Signature Attached
                          </span>
                        </div>
                        <button
                          type="button"
                          className="admin-action-btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          onClick={() => setViewDocModal(formData.uploadedFile)}
                        >
                          <Eye size={12} /> Preview
                        </button>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} style={{ color: '#a855f7' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                            Upload Scanned Application with Mentor Verification
                          </strong>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                            Accepted file types: PDF, PNG, JPG (Max 5MB)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="admin-action-btn-primary"
                          style={{ background: '#7c3aed', fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          Select File from Device
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>

              <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="admin-action-btn-secondary"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn-primary"
                  style={{ background: '#4338ca', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={15} /> Submit Application to Warden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: OFFICIAL DIGITAL GATE PASS (PRINTABLE) ── */}
      {selectedDigitalPass && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedDigitalPass(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px', width: '95vw', background: 'transparent', boxShadow: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="digital-pass-card">
              <div className="digital-pass-watermark">
                APPROVED
              </div>

              {/* Header */}
              <div className="digital-pass-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#312e81', color: '#ffffff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                    GIFT
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      BPUT AFFILIATED AUTONOMOUS CAMPUS
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 900 }}>
                      HOSTEL RESIDENT OUTSTATION GATE PASS
                    </h3>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="digital-pass-barcode">{selectedDigitalPass.id}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                    Official Digital Clearance
                  </div>
                </div>
              </div>

              {/* Student and Hostel Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Student Name</span>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{selectedDigitalPass.studentName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Roll &amp; Reg No</span>
                  <div style={{ fontWeight: 700, color: '#4338ca' }}>
                    Roll: {selectedDigitalPass.rollNumber} · Reg: {selectedDigitalPass.registrationNumber}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Hostel Residence</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedDigitalPass.hostelName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Room &amp; Bed #</span>
                  <div style={{ fontWeight: 700, color: '#7c3aed' }}>
                    {selectedDigitalPass.roomNumber} · {selectedDigitalPass.bedNo}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Destination &amp; Purpose</span>
                  <div style={{ fontWeight: 600, color: '#334155' }}>
                    {selectedDigitalPass.purposeType} ({selectedDigitalPass.destination})
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Parent Contact</span>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{selectedDigitalPass.parentPhone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Departure Schedule</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {selectedDigitalPass.outDateTime ? selectedDigitalPass.outDateTime.replace('T', ' ') : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Expected Return</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {selectedDigitalPass.inDateTime ? selectedDigitalPass.inDateTime.replace('T', ' ') : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Endorsements & Official Stamps */}
              <div className="digital-pass-stamps-grid">
                <div className="official-stamp-box" style={{ borderColor: '#2563eb', background: '#eff6ff' }}>
                  <div className="official-stamp-title" style={{ color: '#1d4ed8' }}>
                    FACULTY MENTOR ENDORSEMENT
                  </div>
                  <div className="official-stamp-seal" style={{ color: '#1d4ed8' }}>
                    ✓ VERIFIED &amp; APPROVED
                  </div>
                  <div className="official-stamp-sub">
                    {selectedDigitalPass.mentorName} ({selectedDigitalPass.mentorEmpId || 'Mentor'})
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    Verified on {selectedDigitalPass.mentorVerifiedAt || '05 Oct 2026'}
                  </div>
                </div>

                <div className="official-stamp-box">
                  <div className="official-stamp-title">
                    HOSTEL WARDEN CLEARANCE
                  </div>
                  <div className="official-stamp-seal">
                    ✓ APPROVED FOR OUTING
                  </div>
                  <div className="official-stamp-sub">
                    {selectedDigitalPass.approvedBy || 'Resident Warden'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                    Approved on {selectedDigitalPass.approvedAt}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={28} style={{ color: '#7c3aed' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8' }}>
                      DIGITAL SECURITY GATEWAY CODE
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Scan at Campus Main Gate Biometric Turnstile upon departure and return.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="admin-action-btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#4338ca' }}
                    onClick={() => window.print()}
                  >
                    <Printer size={14} /> Print Pass
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    onClick={() => setSelectedDigitalPass(null)}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: VIEW UPLOADED APPLICATION DOCUMENT ── */}
      {viewDocModal && (
        <div className="admin-modal-backdrop" onClick={() => setViewDocModal(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '600px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} style={{ color: '#4338ca' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                    {viewDocModal.fileName}
                  </h3>
                  <small style={{ color: '#64748b' }}>Uploaded Document Preview · Mentor Verified</small>
                </div>
              </div>
              <button
                className="admin-table-action-btn"
                onClick={() => setViewDocModal(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ maxHeight: '480px', overflowY: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.5rem' }}>
                <HandwrittenApplicationLetter pass={viewDocModal?.passRef || null} doc={viewDocModal} />
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Verified and endorsed by Faculty Mentor with authentic signature &amp; stamp. Ready for Warden Approval.
              </div>
            </div>

            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="admin-action-btn-secondary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} /> Print Document
              </button>
              <button
                type="button"
                className="admin-action-btn-primary"
                onClick={() => setViewDocModal(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
