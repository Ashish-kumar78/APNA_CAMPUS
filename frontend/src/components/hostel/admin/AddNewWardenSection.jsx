import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UserPlus, UserCheck, Shield, Building2, Phone, Mail, Calendar,
  Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, X,
  Eye, RefreshCw, Lock, BadgeCheck, FileText, MapPin, Award
} from 'lucide-react';
import { addNewWarden, getAllWardens } from '../../../services/wardenManagementStore.js';
import { getAllHostels, syncHostelsFromBackend } from '../../../services/hostelAttendanceStore.js';
import { registerNewWardenProfile } from '../wardenProfilesData.js';

// Standard Designation Options
const DESIGNATION_OPTIONS = [
  'Chief Resident Warden (Boys)',
  'Chief Resident Warden (Girls)',
  'Hostel Supervisor (Boys)',
  'Hostel Supervisor (Girls)',
  'Assistant Warden (Boys)',
  'Assistant Warden (Girls)',
  'Resident Facilities Caretaker & Relief Warden',
  'Senior Hostel Superintendent'
];

// Standard Shift Options
const SHIFT_OPTIONS = [
  { shift: 'General / 24x7 Resident', timings: '06:00 AM - 10:00 PM (Rotational Curfew)' },
  { shift: 'Morning & Evening Resident', timings: '07:00 AM - 09:30 PM (Curfew Lock)' },
  { shift: 'Evening & Night Shift', timings: '04:00 PM - 12:00 AM (Night Monitoring)' },
  { shift: 'Night Relief Shift', timings: '08:00 PM - 06:00 AM (Overnight Security)' },
  { shift: 'Day Shift', timings: '08:00 AM - 04:00 PM (Admin Operations)' }
];

// Standard Block Options
const STANDARD_BLOCKS = [
  'All Blocks & Wings (Complete Complex)',
  'Block A (Rooms 101-220)',
  'Block B (Rooms 201-320)',
  'Block C (Rooms 301-420)',
  'Wing A (Floors 1-3)',
  'Wing B (Floors 1-2)',
  'North Wing (Ground + 3 Floors)',
  'Ground & 1st Floor',
  '2nd & 3rd Floor'
];

// Pre-packaged professional avatar presets
const AVATAR_PRESETS = [
  { label: 'Male Warden 1', url: '/candidate_photo_apna.png' },
  { label: 'Male Warden 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' },
  { label: 'Female Warden 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250' },
  { label: 'Female Warden 2', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250' }
];

export default function AddNewWardenSection({ onWardenCreated, onCancel, showToast }) {
  const fileInputRef = useRef(null);

  // Compute next available numerical ID (e.g. WRD-107)
  const autoNextId = useMemo(() => {
    const all = getAllWardens();
    const nums = all
      .map(w => parseInt(String(w.id || '').replace('WRD-', ''), 10))
      .filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 106;
    return `WRD-${max + 1}`;
  }, []);

  const [campusHostels, setCampusHostels] = useState(() => {
    const list = getAllHostels();
    if (list && list.length > 0) return list;
    return [
      { id: 'hst-1', name: 'Gandhi Boys Residence' },
      { id: 'hst-2', name: 'Sarojini Girls Residence' },
      { id: 'hst-3', name: 'Bhabani Hostel-1' },
      { id: 'hst-4', name: 'Bhabani Hostel-2' },
      { id: 'hst-5', name: 'Kalam Boys Residence' },
      { id: 'hst-6', name: 'Central Hostel Complex' }
    ];
  });

  useEffect(() => {
    let isMounted = true;
    syncHostelsFromBackend().then(list => {
      if (isMounted && list && list.length > 0) setCampusHostels(list);
    }).catch(err => {
      console.warn('Backend campus hostels sync fallback:', err?.message || err);
    });

    const handleHostelsUpdate = () => {
      const list = getAllHostels();
      if (list && list.length > 0) setCampusHostels(list);
    };
    window.addEventListener('bput_hostels_updated', handleHostelsUpdate);
    window.addEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
    window.addEventListener('storage', handleHostelsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('bput_hostels_updated', handleHostelsUpdate);
      window.removeEventListener('bput_hostel_complexes_updated', handleHostelsUpdate);
      window.removeEventListener('storage', handleHostelsUpdate);
    };
  }, []);

  // Form State matching 100% of the Warden Dashboard & Profile details
  const [formData, setFormData] = useState({
    // Identity & Institutional
    employeeId: autoNextId,
    bputRegdNo: `BPUT-EMP-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: 'Mr.',
    firstName: '',
    middleName: '',
    lastName: '',
    designation: 'Chief Resident Warden (Boys)',
    department: 'Hostel Administration & Student Housing',
    category: 'Non Teaching',
    joiningDate: new Date().toISOString().split('T')[0],

    // Photo (Admin role only)
    avatar: '/candidate_photo_apna.png',
    photoUrl: '/candidate_photo_apna.png',
    photoFileName: '',

    // Hostel Assignment
    hostelName: campusHostels[0]?.name || 'Gandhi Boys Residence',
    assignedBlocks: 'Block A (Rooms 101-220)',
    dutyShift: 'General / 24x7 Resident',
    shiftTimings: '06:00 AM - 10:00 PM (Rotational Curfew)',
    roomOffice: 'Staff Quarters Block A-102, Campus Residential Complex',

    // Contact
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyRelationship: 'Spouse',
    guardianMobile: '',

    // Personal & Demographic
    gender: 'Male',
    empDob: '1985-06-15',
    bloodGroup: 'B+',
    qualification: 'M.Tech, B.Tech',
    specialization: 'Hostel Administration & Student Housing Care',
    totalExperience: '6 Year(s) 4 Month(s)',
    aadhaarNo: '',
    panNo: '',
    presentAddress1: 'Staff Quarters Block A-102',
    presentCity: 'Bhubaneswar',
    presentDistrict: 'Khordha',
    presentPin: '751024',

    // CMS Credentials
    username: autoNextId,
    password: 'Warden@2026',

    // Granular Scoped Permissions Preset
    permissions: {
      submitAttendance: true,
      manageAttendance: true,
      manageGatePasses: true,
      reviewStudentLeaves: true,
      manageRoomAllocations: true,
      manageComplaints: true,
      createInventoryRequisitions: true,
      viewHostelRecords: true,
      viewRoomAllocations: true,
      viewReports: true,
      exportReports: false,
      editHostelConfiguration: false
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});

  // Computed Full Name
  const fullName = useMemo(() => {
    return `${formData.title} ${formData.firstName.trim()} ${formData.middleName.trim()} ${formData.lastName.trim()}`.replace(/\s+/g, ' ').trim();
  }, [formData.title, formData.firstName, formData.middleName, formData.lastName]);

  // Handle Photo Upload via File Reader
  const handlePhotoUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setFormData(prev => ({
        ...prev,
        avatar: dataUrl,
        photoUrl: dataUrl,
        photo: dataUrl,
        photoFileName: file.name
      }));
      if (showToast) {
        showToast(`✓ Profile photo (${file.name}) uploaded and set as DP!`);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Synchronize Gender with Title when Title changes (can still be overridden via Gender dropdown)
  const handleTitleChange = (newTitle) => {
    let autoGender = formData.gender;
    if (newTitle === 'Mr.') autoGender = 'Male';
    else if (newTitle === 'Mrs.' || newTitle === 'Ms.') autoGender = 'Female';
    setFormData(prev => ({ ...prev, title: newTitle, gender: autoGender }));
  };

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Mobile contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Official email ID is required';
    if (!formData.hostelName) newErrors.hostelName = 'Hostel assignment is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (showToast) showToast('⚠️ Please fill in all required fields highlighted in red.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedHostelObj = campusHostels.find(h => h.name === formData.hostelName);

      const wardenPayload = {
        ...formData,
        id: formData.employeeId,
        employeeId: formData.employeeId,
        name: fullName,
        hostelId: selectedHostelObj?.id || 'hst-1',
        hostelName: formData.hostelName,
        assignedBlocks: [formData.assignedBlocks],
        accountStatus: 'Active',
        dutyStatus: 'On Duty',
        gender: formData.gender,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
        mobileNo: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
        email: formData.email,
        emailId: formData.email,
        avatar: formData.avatar,
        photoUrl: formData.avatar,
        photo: formData.avatar,
        notes: `Residential warden registered on ${new Date().toLocaleDateString('en-GB')}.`
      };

      // 1. Add to Warden Management Store (Persists locally & syncs backend)
      const savedWarden = addNewWarden(wardenPayload);

      // 2. Register full 10-tab dossier profile
      registerNewWardenProfile(savedWarden);

      // 3. Persist individual avatar key and broadcast for instantaneous header & profile sync
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`hostel_officer_avatar_${savedWarden.id}`, savedWarden.avatar);
        window.localStorage.setItem(`hostel_officer_avatar_${savedWarden.employeeId}`, savedWarden.avatar);
        window.dispatchEvent(new CustomEvent('hostel_avatar_changed', { detail: { id: savedWarden.id, avatar: savedWarden.avatar } }));
        window.dispatchEvent(new Event('bput_wardens_updated'));
      }

      if (showToast) {
        showToast(`✓ New Warden ${savedWarden.name} (${savedWarden.id}) registered successfully!`);
      }

      // 3. Callback to parent
      if (onWardenCreated) {
        onWardenCreated(savedWarden);
      }
    } catch (err) {
      console.error('Error adding warden:', err);
      alert('Failed to register warden: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        borderRadius: '14px',
        padding: '1.5rem 2rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              HOSTEL HR ONBOARDING
            </span>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
              Employee ID: <strong style={{ color: '#fef08a' }}>{formData.employeeId}</strong>
            </span>
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0 }}>
            Register New Hostel Warden
          </h2>
          <p style={{ margin: '0.35rem 0 0 0', opacity: 0.9, fontSize: '0.88rem', maxWidth: '650px' }}>
            Complete the full employment dossier, upload official credentials and photograph, assign residential blocks, and configure operational permissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '0.6rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ← Back to Directory
            </button>
          )}
        </div>
      </div>

      {/* Main Form + Live Preview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 340px',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: THE FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* CARD 1: PHOTO & PROFILE AVATAR (ADMIN ONLY) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <Upload size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                1. Official Photograph &amp; Identity Badge <span style={{ fontSize: '0.74rem', color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: '4px' }}>ADMIN UPLOAD ONLY</span>
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Photo Display Ring (DP - Profile Picture) */}
              <div
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Click to Upload / Change Profile Picture (DP)"
                style={{
                  position: 'relative',
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: '4px solid #3b82f6',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
                  cursor: 'pointer',
                  backgroundColor: '#f1f5f9'
                }}
              >
                <img
                  src={formData.avatar}
                  alt="Warden Profile Picture (DP)"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    if (e.target.src !== '/candidate_photo_apna.png') {
                      e.target.src = '/candidate_photo_apna.png';
                    }
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 23, 42, 0.72)',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '4px 0',
                  backdropFilter: 'blur(3px)',
                  letterSpacing: '0.3px'
                }}>
                  Change DP
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  border: dragOver ? '2px dashed #2563eb' : (formData.photoFileName ? '2px dashed #10b981' : '2px dashed #cbd5e1'),
                  background: dragOver ? '#eff6ff' : (formData.photoFileName ? '#f0fdf4' : '#f8fafc'),
                  borderRadius: '10px',
                  padding: '1.25rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePhotoUpload(e.target.files[0]);
                    }
                  }}
                />
                {formData.photoFileName ? (
                  <>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      Uploaded: {formData.photoFileName}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                      ✓ Official photo active and displayed in DP (Profile Picture)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                      Click or drag &amp; drop to replace photograph (PNG, JPG, WebP up to 5MB)
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="#3b82f6" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      Click to Upload or Drag &amp; Drop Photo
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
                      Supports PNG, JPG, WebP up to 5MB (Official passport photograph)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                Or select a preset professional resident avatar:
              </span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      avatar: p.url,
                      photoUrl: p.url,
                      photo: p.url,
                      photoFileName: p.label
                    }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: formData.avatar === p.url ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: formData.avatar === p.url ? '#eff6ff' : '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <img src={p.url} alt={p.label} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2: EMPLOYMENT PARTICULARS */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <BadgeCheck size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                2. Employment &amp; Institutional Particulars
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Employee ID <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={e => setFormData({ ...formData, employeeId: e.target.value, username: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: '#f8fafc',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  BPUT Registration No.
                </label>
                <input
                  type="text"
                  value={formData.bputRegdNo}
                  onChange={e => setFormData({ ...formData, bputRegdNo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Title
                </label>
                <select
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  First Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subrat"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.firstName ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Middle Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kumar"
                  value={formData.middleName}
                  onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Last Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jena"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.lastName ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Gender <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff'
                  }}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Designation / Role Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                >
                  {DESIGNATION_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Joining / Appointment Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CARD 3: HOSTEL ASSIGNMENT & DUTY SHIFT */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <Building2 size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                3. Residential Hostel &amp; Shift Allocation
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assigned Hostel Complex <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.hostelName}
                  onChange={e => setFormData({ ...formData, hostelName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.hostelName ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                  required
                >
                  {campusHostels.map(h => (
                    <option key={h.id || h.name} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assigned Residential Blocks &amp; Wings
                </label>
                <select
                  value={formData.assignedBlocks}
                  onChange={e => setFormData({ ...formData, assignedBlocks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                >
                  {STANDARD_BLOCKS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Duty Shift
                </label>
                <select
                  value={formData.dutyShift}
                  onChange={e => {
                    const sel = SHIFT_OPTIONS.find(s => s.shift === e.target.value);
                    setFormData({
                      ...formData,
                      dutyShift: e.target.value,
                      shiftTimings: sel ? sel.timings : formData.shiftTimings
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                >
                  {SHIFT_OPTIONS.map(s => (
                    <option key={s.shift} value={s.shift}>{s.shift}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Shift Timings &amp; Curfew Lock
                </label>
                <input
                  type="text"
                  value={formData.shiftTimings}
                  onChange={e => setFormData({ ...formData, shiftTimings: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  On-Campus Quarters / Warden Office Room No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff Quarters Block A-102, Campus Residential Complex"
                  value={formData.roomOffice}
                  onChange={e => setFormData({ ...formData, roomOffice: e.target.value, presentAddress1: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CARD 4: CONTACT & EMERGENCY */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <Phone size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                4. Contact, Emergency &amp; Identification Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Official Email ID <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. subrat.jena@gift.edu.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.email ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Primary Mobile Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9437012345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: errors.phone ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Emergency Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sunita Jena (Spouse)"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 94370 99881"
                  value={formData.guardianMobile}
                  onChange={e => setFormData({ ...formData, guardianMobile: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Highest Qualification
                </label>
                <input
                  type="text"
                  placeholder="e.g. M.Tech, B.Tech (Mechanical)"
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Gender <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#ffffff'
                  }}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  placeholder="12 digit Aadhaar No."
                  maxLength={12}
                  value={formData.aadhaarNo}
                  onChange={e => setFormData({ ...formData, aadhaarNo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  PAN Card Number
                </label>
                <input
                  type="text"
                  placeholder="10 char PAN No."
                  maxLength={10}
                  value={formData.panNo}
                  onChange={e => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase'
                  }}
                />
              </div>
            </div>
          </div>

          {/* CARD 5: ACCESS PERMISSIONS & CMS CREDENTIALS */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <Shield size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                5. Scoped Operational Privileges &amp; CMS Login Credentials
              </h3>
            </div>

            {/* Permissions Toggles Grid */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>
                Initial Granted Permissions:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
                {[
                  { key: 'submitAttendance', label: 'Submit Night Roll Call Attendance' },
                  { key: 'reviewStudentLeaves', label: 'Approve & Review Student Leaves' },
                  { key: 'manageGatePasses', label: 'Approve & Track Gate Passes' },
                  { key: 'createInventoryRequisitions', label: 'Raise Indents & Material Requisitions' },
                  { key: 'manageRoomAllocations', label: 'Allocate & Transfer Resident Beds' },
                  { key: 'manageComplaints', label: 'Assign & Resolve Cleanliness Complaints' },
                  { key: 'registerVisitors', label: 'Register Hostel Campus Visitors' }
                ].map(item => (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: formData.permissions[item.key] ? '#eff6ff' : '#f8fafc',
                      border: formData.permissions[item.key] ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: formData.permissions[item.key] ? '#1d4ed8' : '#64748b'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(formData.permissions[item.key])}
                      onChange={e => {
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [item.key]: e.target.checked
                          }
                        });
                      }}
                      style={{ accentColor: '#2563eb' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Login Account Details */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Login Username / Identifier
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    background: '#f1f5f9',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Initial Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON ROW */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            padding: '1rem 0',
            alignItems: 'center'
          }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                border: 'none',
                background: isSubmitting ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              <UserPlus size={18} />
              <span>{isSubmitting ? 'Registering...' : 'Register & Onboard Warden'}</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: LIVE BADGE & PROFILE PREVIEW */}
        <aside style={{ position: 'sticky', top: '20px' }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            {/* Header pattern */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              padding: '1.25rem',
              color: '#ffffff',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: 700 }}>
                Live Staff Dossier Preview
              </span>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                border: '3px solid #ffffff',
                margin: '10px auto 0',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <img
                  src={formData.avatar}
                  alt="Avatar Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/candidate_photo_apna.png'; }}
                />
              </div>
            </div>

            {/* Profile body */}
            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {fullName || 'Warden Full Name'}
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                {formData.designation}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <span style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {formData.employeeId}
                </span>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  ● Active
                </span>
              </div>

              {/* Assignment Box */}
              <div style={{
                marginTop: '1.25rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '0.85rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  <Building2 size={13} color="#2563eb" /> Assigned Hostel
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {formData.hostelName}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                  {formData.assignedBlocks}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
                  {formData.dutyShift}
                </div>
              </div>

              {/* Quick specs */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', fontSize: '0.76rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Phone:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formData.phone || 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formData.email || 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Blood Group:</span>
                  <span style={{ fontWeight: 700, color: '#dc2626' }}>{formData.bloodGroup}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Gender:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{formData.gender}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Qualification:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formData.qualification}</span>
                </div>
              </div>

              {/* Notice */}
              <div style={{
                marginTop: '1rem',
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.72rem',
                lineHeight: 1.35
              }}>
                ✓ Clicking "Register &amp; Onboard" adds this warden across all attendance, room allocation, and gate pass consoles.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
