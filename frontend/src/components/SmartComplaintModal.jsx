import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Trash2,
  RotateCcw,
  FileText,
  Building,
  MapPin,
  Layers,
  Wrench,
  Zap,
  Brush,
  Armchair,
  Home,
  Wifi,
  HelpCircle,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import './SmartComplaintModal.css';

// 7 Official College Complaint Categories
export const COLLEGE_CATEGORIES = [
  {
    key: 'PLUMBING',
    label: 'Plumbing',
    icon: Wrench,
    desc: 'Taps, pipes, leakage, washbasins, drainage & water supply',
    example: 'Leaking tap, geyser malfunction, clogged drain',
  },
  {
    key: 'ELECTRICAL',
    label: 'Electrical',
    icon: Zap,
    desc: 'Switches, ceiling fans, tube lights, sockets & MCB trips',
    example: 'Broken switch, fan regulator, burnt socket',
  },
  {
    key: 'CLEANING',
    label: 'Cleaning',
    icon: Brush,
    desc: 'Washrooms, dustbins, corridor housekeeping & spills',
    example: 'Unclean washroom, overflowing dustbin, stained floor',
  },
  {
    key: 'FURNITURE',
    label: 'Furniture',
    icon: Armchair,
    desc: 'Chairs, study tables, beds, cots, wardrobes & almirahs',
    example: 'Broken chair wheel, damaged study desk, loose bed frame',
  },
  {
    key: 'CIVIL',
    label: 'Civil Works',
    icon: Home,
    desc: 'Wall cracks, plaster, doors, window latches, floor tiles & masonry',
    example: 'Wall crack, loose door lock, window glass crack',
  },
  {
    key: 'NETWORK',
    label: 'Network / IT',
    icon: Wifi,
    desc: 'Wi-Fi access points, LAN ports, routers & lab systems',
    example: 'Wi-Fi offline in wing, dead ethernet port, router issue',
  },
  {
    key: 'OTHER',
    label: 'Other / General',
    icon: HelpCircle,
    desc: 'General maintenance, administrative inspection & miscellaneous',
    example: 'Noise issue, pest control, unlisted maintenance request',
  },
];

const BUILDINGS = [
  'Sarojini Girls Residence (Block A)',
  'Sarojini Girls Residence (Block B)',
  'Gandhi Boys Residence (Block A)',
  'Gandhi Boys Residence (Block B)',
  'Ramanujan Academic Block',
  'Aryabhata Science & Computing Complex',
  'Central Library & Knowledge Center',
  'Campus Dining Hall & Food Court',
];

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];

const AREAS = [
  'Room Attached Bathroom',
  'Student Room Living & Study Area',
  'Floor Common Washroom',
  'Corridor & Water Cooler Point',
  'Common Room / Study Hall',
  'Classroom Complex',
  'Computer & Network Lab',
  'Staircase & Balcony Area',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function SmartComplaintModal({
  isOpen,
  onClose,
  onComplaintSubmitted,
  defaultLocation = 'Room 204 Attached Bathroom',
  hostelName = 'Sarojini Girls Residence (Block A)',
  roomNumber = '204',
  studentName = 'Rakesh Das',
  rollNumber = '01',
}) {
  // Form State
  const [building, setBuilding] = useState(hostelName);
  const [floor, setFloor] = useState('2nd Floor');
  const [area, setArea] = useState('Room Attached Bathroom');
  const [locationDetails, setLocationDetails] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [validationError, setValidationError] = useState('');

  // AI Analysis State
  // status: 'IDLE' | 'ANALYZING' | 'COMPLETE' | 'UNCERTAIN' | 'FAILED'
  const [aiStatus, setAiStatus] = useState('IDLE');
  const [aiResult, setAiResult] = useState(null);

  // Editable Complaint Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Submission & UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [draftSavedMessage, setDraftSavedMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Restore draft from localStorage on mount
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem('apna_complaint_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.priority) setPriority(parsed.priority);
        if (parsed.locationDetails) setLocationDetails(parsed.locationDetails);
        setDraftSavedMessage('Draft restored from previous session');
        setTimeout(() => setDraftSavedMessage(''), 3500);
      }
    } catch {
      // Ignore storage errors
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const constructedLocation = `${building} · ${floor} · ${area}${locationDetails.trim() ? ` (${locationDetails.trim()})` : ''}`;

  // Image Processing & Validation
  const processImageFile = (file) => {
    setValidationError('');
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError('Unsupported format. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      setImageFile(file);
      setImagePreview(b64);
      setImageMeta({
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        type: file.type.replace('image/', '').toUpperCase(),
      });

      // Automatically trigger image analysis
      runImageAnalysis(b64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageMeta(null);
    setAiStatus('IDLE');
    setAiResult(null);
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run AI Vision Analysis
  const runImageAnalysis = async (base64Data, filename) => {
    setAiStatus('ANALYZING');
    setValidationError('');

    try {
      const locationHint = `${building} - ${area}`;
      const res = await api.previewVisionComplaint(base64Data, filename, locationHint);

      if (res && res.data) {
        const v = res.data;
        const mappedCat = v.collegeCategory || v.college_category || v.category?.toUpperCase() || 'OTHER';
        const conf = typeof v.confidence === 'number' ? v.confidence : 0.75;
        const isUncertain = v.needsReview || conf < 0.65 || mappedCat === 'OTHER';

        setAiResult({
          title: v.title || 'Water Fixture / Maintenance Issue',
          description: v.description || 'Photo maintenance complaint filed by student.',
          collegeCategory: mappedCat,
          confidence: conf,
          confidenceLevel: v.confidenceLevel || v.confidence_level || (conf >= 0.8 ? 'high' : conf >= 0.6 ? 'medium' : 'low'),
          explanation: v.explanation || 'Visual analysis performed on uploaded image.',
          detectedCues: v.detectedCues || v.detected_cues || [],
          suggestedPriority: v.suggestedPriority || v.suggested_priority || 'Medium',
          needsReview: isUncertain,
          source: v.source || 'ai_vision',
        });

        // Pre-fill editable details with suggestions if user hasn't typed anything yet
        setTitle((prev) => (prev.trim() ? prev : v.title || ''));
        setDescription((prev) => (prev.trim() ? prev : v.description || ''));
        setCategory(mappedCat);
        if (v.suggestedPriority) setPriority(v.suggestedPriority);

        setAiStatus(isUncertain ? 'UNCERTAIN' : 'COMPLETE');
      } else {
        throw new Error('Empty response from AI vision service');
      }
    } catch (err) {
      console.warn('AI Vision analysis fallback engaged:', err);
      // Safe offline fallback
      setAiStatus('FAILED');
      setAiResult({
        title: 'Maintenance Issue Requires Review',
        description: 'Photo submitted for maintenance inspection. Please confirm problem details.',
        collegeCategory: 'OTHER',
        confidence: 0,
        confidenceLevel: 'low',
        explanation: 'AI Service is currently offline or timed out. Please select your complaint category manually.',
        detectedCues: ['Photo uploaded for human staff inspection'],
        suggestedPriority: 'Medium',
        needsReview: true,
        source: 'safe_offline_rule',
      });
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!aiResult) return;
    setTitle(aiResult.title);
    setDescription(aiResult.description);
    setCategory(aiResult.collegeCategory);
    setPriority(aiResult.suggestedPriority);
  };

  // Save Draft to LocalStorage
  const handleSaveDraft = () => {
    try {
      const draft = {
        title,
        category,
        description,
        priority,
        locationDetails,
        building,
        floor,
        area,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('apna_complaint_draft', JSON.stringify(draft));
      setDraftSavedMessage('Draft saved successfully!');
      setTimeout(() => setDraftSavedMessage(''), 3000);
    } catch {
      setDraftSavedMessage('Could not save draft to browser storage');
    }
  };

  // Final Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() && !imagePreview) {
      setValidationError('Please provide an issue title or upload a photo.');
      return;
    }

    if (!description.trim() && !imagePreview) {
      setValidationError('Please provide a short description of the issue.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      const finalTitle = title.trim() || aiResult?.title || 'Maintenance Request from Photo';
      const finalDesc = description.trim() || aiResult?.description || finalTitle;

      const payload = {
        title: finalTitle,
        description: finalDesc,
        category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
        location: constructedLocation,
        priority: priority,
        hostel: building,
        roomNumber: roomNumber,
        rollNumber: rollNumber,
        studentName: studentName,
        attachmentUrl: imagePreview || null,
        filename: imageFile?.name || 'complaint_photo.jpg',
      };

      const res = await api.lodgeComplaint(payload);
      const ticket = res?.data || {
        id: `CMP-${Date.now().toString().slice(-4)}`,
        title: finalTitle,
        description: finalDesc,
        category: payload.category,
        location: constructedLocation,
        priority: priority,
        status: aiResult?.needsReview ? 'Needs Review' : 'Assigned',
        assignedStaffName: category === 'PLUMBING' ? 'Suresh Mohapatra' : category === 'ELECTRICAL' ? 'Pramod Panda' : 'Campus Maintenance Team',
        assignedStaffRole: category === 'PLUMBING' ? 'Plumber & Water Works' : 'Maintenance Specialist',
        filedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        imageUrl: imagePreview || null,
      };

      // Clear draft on successful submission
      localStorage.removeItem('apna_complaint_draft');

      setSubmittedTicket(ticket);
      if (onComplaintSubmitted) {
        onComplaintSubmitted(ticket);
      }
    } catch (err) {
      setValidationError(err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="smart-complaint-backdrop" onClick={() => !isSubmitting && onClose()}>
      <div
        className="smart-complaint-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-complaint-title"
      >
        {/* MODAL HEADER */}
        <div className="smart-complaint-header">
          <div className="smart-complaint-header-left">
            <div className="smart-complaint-header-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 id="smart-complaint-title" className="smart-complaint-header-title">
                Lodge Smart Maintenance Complaint
              </h2>
              <p className="smart-complaint-header-subtitle">
                AI-Assisted Image Analysis &amp; Verified Technician Allocation
              </p>
            </div>
          </div>
          <button
            type="button"
            className="smart-complaint-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {submittedTicket ? (
          <div className="scm-success-card">
            <div className="scm-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>
              Complaint Registered Successfully!
            </h3>
            <div className="scm-ticket-badge">
              #{submittedTicket.id || 'CMP-2026-CONFIRMED'}
            </div>
            <p style={{ color: '#475569', fontSize: '0.88rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
              {submittedTicket.assignedStaffName ? (
                <>
                  Assigned to <strong>{submittedTicket.assignedStaffName}</strong> ({submittedTicket.assignedStaffRole || 'Technician'}). You will receive status updates in your maintenance timeline.
                </>
              ) : (
                <>
                  Queued in the <strong>Supervisor Triage Queue</strong> for category verification and staff dispatch.
                </>
              )}
            </p>

            <div className="scm-review-card" style={{ maxWidth: 480, width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
              <div className="scm-review-row">
                <span className="scm-review-label">Category:</span>
                <span className="scm-review-val">{submittedTicket.category}</span>
              </div>
              <div className="scm-review-row">
                <span className="scm-review-label">Location:</span>
                <span className="scm-review-val">{submittedTicket.location}</span>
              </div>
              <div className="scm-review-row">
                <span className="scm-review-label">Priority:</span>
                <span className="scm-review-val">{submittedTicket.priority}</span>
              </div>
              <div className="scm-review-row">
                <span className="scm-review-label">Status:</span>
                <span className="scm-review-val" style={{ color: '#7c3aed' }}>{submittedTicket.status}</span>
              </div>
            </div>

            <button
              type="button"
              className="scm-btn-primary"
              onClick={onClose}
              style={{ marginTop: '1rem', minWidth: 160 }}
            >
              Done
            </button>
          </div>
        ) : (
          /* MAIN COMPLAINT FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="smart-complaint-body">
              {/* Validation / Notice Banners */}
              {validationError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '10px',
                    color: '#e11d48',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{validationError}</span>
                </div>
              )}

              {draftSavedMessage && (
                <div
                  style={{
                    padding: '0.6rem 1rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    color: '#166534',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Check size={16} />
                  <span>{draftSavedMessage}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION A: LOCATION                                      */}
              {/* ======================================================== */}
              <div className="scm-section">
                <div className="scm-section-header">
                  <h3 className="scm-section-title">
                    <Building size={16} style={{ color: '#7c3aed' }} />
                    Section A: Location of Defect
                  </h3>
                  <span className="scm-section-badge required">Required</span>
                </div>

                <div className="scm-grid-3">
                  <div className="scm-form-field">
                    <label className="scm-label" htmlFor="scm-building">Hostel / Building</label>
                    <select
                      id="scm-building"
                      className="scm-select"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                    >
                      {BUILDINGS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="scm-form-field">
                    <label className="scm-label" htmlFor="scm-floor">Floor</label>
                    <select
                      id="scm-floor"
                      className="scm-select"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                    >
                      {FLOORS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="scm-form-field">
                    <label className="scm-label" htmlFor="scm-area">Area / Wing</label>
                    <select
                      id="scm-area"
                      className="scm-select"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    >
                      {AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="scm-form-field">
                  <label className="scm-label" htmlFor="scm-loc-details">
                    <span>Room Number or Exact Landmark</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>e.g. Room 204 attached toilet, near washbasin</span>
                  </label>
                  <input
                    id="scm-loc-details"
                    type="text"
                    className="scm-input"
                    placeholder={`e.g. Room ${roomNumber} or Washbasin #2`}
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                  />
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION B: EVIDENCE (PHOTO UPLOAD)                       */}
              {/* ======================================================== */}
              <div className="scm-section">
                <div className="scm-section-header">
                  <h3 className="scm-section-title">
                    <Upload size={16} style={{ color: '#7c3aed' }} />
                    Section B: Photo Evidence
                  </h3>
                  <span className="scm-section-badge">Recommended for AI Analysis</span>
                </div>

                {!imagePreview ? (
                  <div
                    className={`scm-dropzone ${dragActive ? 'active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    <div className="scm-dropzone-icon">
                      <Upload size={22} />
                    </div>
                    <div className="scm-dropzone-text">
                      Drag &amp; drop a photo here, or <span style={{ color: '#7c3aed', textDecoration: 'underline' }}>browse</span>
                    </div>
                    <div className="scm-dropzone-hint">
                      Supports JPEG, PNG, WebP up to 5MB. AI will analyze the image to suggest category &amp; title.
                    </div>
                  </div>
                ) : (
                  <div className="scm-preview-container">
                    <img src={imagePreview} alt="Defect preview" className="scm-preview-thumb" />
                    <div className="scm-preview-info">
                      <span className="scm-preview-name">{imageMeta?.name || 'Uploaded photo'}</span>
                      <div className="scm-preview-meta">
                        <span>{imageMeta?.size}</span>
                        <span>•</span>
                        <span>{imageMeta?.type}</span>
                        <span>•</span>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Attached</span>
                      </div>
                    </div>
                    <div className="scm-preview-actions">
                      <button
                        type="button"
                        className="scm-btn-outline"
                        onClick={() => fileInputRef.current?.click()}
                        title="Replace photo with another file"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="scm-btn-danger-outline"
                        onClick={handleRemoveImage}
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {/* ======================================================== */}
              {/* SECTION C: AI ANALYSIS CARD                              */}
              {/* ======================================================== */}
              {imagePreview && (
                <div className="scm-section">
                  <div className="scm-section-header">
                    <h3 className="scm-section-title">
                      <Sparkles size={16} style={{ color: '#7c3aed' }} />
                      Section C: AI Defect Analysis
                    </h3>
                    <span className="scm-section-badge ai">AI Suggestions</span>
                  </div>

                  <div
                    className={`scm-ai-card ${
                      aiStatus === 'ANALYZING'
                        ? 'analyzing'
                        : aiStatus === 'COMPLETE'
                        ? aiResult?.confidenceLevel || 'medium'
                        : aiStatus === 'UNCERTAIN'
                        ? 'low'
                        : aiStatus === 'FAILED'
                        ? 'error'
                        : ''
                    }`}
                  >
                    <div className="scm-ai-topbar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {aiStatus === 'ANALYZING' && (
                          <span className="scm-ai-status-pill analyzing">
                            <Clock size={13} className="scm-spin" /> Analyzing Photo with Computer Vision...
                          </span>
                        )}
                        {aiStatus === 'COMPLETE' && (
                          <span className={`scm-ai-status-pill ${aiResult?.confidenceLevel || 'high'}`}>
                            <CheckCircle2 size={13} />
                            Suggested: {aiResult?.collegeCategory} ({Math.round((aiResult?.confidence || 0) * 100)}% Confidence)
                          </span>
                        )}
                        {aiStatus === 'UNCERTAIN' && (
                          <span className="scm-ai-status-pill low">
                            <AlertTriangle size={13} />
                            AI Unsure — Manual Verification Required
                          </span>
                        )}
                        {aiStatus === 'FAILED' && (
                          <span className="scm-ai-status-pill error">
                            <AlertCircle size={13} />
                            AI Offline — Manual Category Selection
                          </span>
                        )}
                      </div>

                      {aiStatus !== 'ANALYZING' && (
                        <button
                          type="button"
                          className="scm-btn-outline"
                          style={{ fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => runImageAnalysis(imagePreview, imageFile?.name || 'photo.jpg')}
                        >
                          <RotateCcw size={12} /> Re-analyze
                        </button>
                      )}
                    </div>

                    {/* Confidence Meter */}
                    {aiStatus !== 'ANALYZING' && aiResult && aiResult.confidence > 0 && (
                      <div>
                        <div className="scm-ai-confidence-bar">
                          <div
                            className={`scm-ai-confidence-fill ${aiResult.confidenceLevel}`}
                            style={{ width: `${Math.round(aiResult.confidence * 100)}%` }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                          <span>Confidence Metric</span>
                          <span>
                            {aiResult.confidenceLevel === 'high' ? 'High Confidence (Verified)' : aiResult.confidenceLevel === 'medium' ? 'Moderate Confidence (Verify Below)' : 'Low Confidence (Manual Review)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {aiResult && (
                      <div className="scm-ai-explanation">
                        <strong>AI Observation:</strong> {aiResult.explanation}
                      </div>
                    )}

                    {/* Detected Cues */}
                    {aiResult?.detectedCues && aiResult.detectedCues.length > 0 && (
                      <div className="scm-ai-cues-list">
                        {aiResult.detectedCues.map((cue, idx) => (
                          <span key={idx} className="scm-ai-cue-chip">
                            🔍 {cue}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Apply Action */}
                    {aiResult && aiStatus !== 'ANALYZING' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="scm-ai-disclaimer">
                          <Info size={12} />
                          Suggestions are advisory. You can edit title, category, and details below.
                        </span>
                        <button
                          type="button"
                          className="scm-btn-outline"
                          onClick={handleApplyAiSuggestions}
                          style={{ color: '#7c3aed', borderColor: '#ddd6fe', background: '#ffffff' }}
                        >
                          <Sparkles size={13} />
                          Apply Suggestions to Form
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SECTION D: COMPLAINT DETAILS                             */}
              {/* ======================================================== */}
              <div className="scm-section">
                <div className="scm-section-header">
                  <h3 className="scm-section-title">
                    <FileText size={16} style={{ color: '#7c3aed' }} />
                    Section D: Verified Complaint Details
                  </h3>
                  <span className="scm-section-badge required">Student Confirmed</span>
                </div>

                {/* Category Selection: 7 Distinct College Categories */}
                <div className="scm-form-field">
                  <label className="scm-label">
                    <span>
                      Complaint Category <span style={{ color: '#e11d48' }}>*</span>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Select the domain matching the defect
                    </span>
                  </label>
                  <div className="scm-category-grid">
                    {COLLEGE_CATEGORIES.map((cat) => {
                      const IconComp = cat.icon;
                      const isSelected = category === cat.key;
                      return (
                        <div
                          key={cat.key}
                          className={`scm-category-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => setCategory(cat.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setCategory(cat.key)}
                        >
                          <div className="scm-category-tile-header">
                            <span className="scm-category-tile-name">{cat.label}</span>
                            <IconComp size={15} style={{ color: isSelected ? '#7c3aed' : '#94a3b8' }} />
                          </div>
                          <span className="scm-category-tile-desc">{cat.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="scm-form-field">
                  <label className="scm-label" htmlFor="scm-title">
                    <span>
                      Issue Title <span style={{ color: '#e11d48' }}>*</span>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Concise summary (e.g. Water tap leaking near washbasin)
                    </span>
                  </label>
                  <input
                    id="scm-title"
                    type="text"
                    className="scm-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bathroom tap is leaking continuously"
                    required
                  />
                </div>

                {/* Description */}
                <div className="scm-form-field">
                  <label className="scm-label" htmlFor="scm-desc">
                    <span>
                      Detailed Description <span style={{ color: '#e11d48' }}>*</span>
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {description.length} / 500 characters
                    </span>
                  </label>
                  <textarea
                    id="scm-desc"
                    className="scm-textarea"
                    value={description}
                    maxLength={500}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what is broken, when it started, and any specific details for the maintenance technician..."
                    required
                  />
                </div>

                {/* Priority Selection */}
                <div className="scm-form-field">
                  <label className="scm-label">
                    <span>Priority Level</span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Standard response SLA depends on urgency
                    </span>
                  </label>
                  <div className="scm-priority-group">
                    <button
                      type="button"
                      className={`scm-priority-btn ${priority === 'Low' ? 'selected-low' : ''}`}
                      onClick={() => setPriority('Low')}
                    >
                      Low (Routine, 48h)
                    </button>
                    <button
                      type="button"
                      className={`scm-priority-btn ${priority === 'Medium' ? 'selected-medium' : ''}`}
                      onClick={() => setPriority('Medium')}
                    >
                      Medium (Standard, 24h)
                    </button>
                    <button
                      type="button"
                      className={`scm-priority-btn ${priority === 'High' ? 'selected-high' : ''}`}
                      onClick={() => setPriority('High')}
                    >
                      High / Urgent (Same Day)
                    </button>
                  </div>
                  {priority === 'High' && (
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '4px' }}>
                      ⚠️ <strong>Emergency Note:</strong> For immediate hazards (short circuit, major water pipe burst), please notify the hostel security desk directly.
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION E: REVIEW SUMMARY                                */}
              {/* ======================================================== */}
              <div className="scm-section">
                <div className="scm-section-header">
                  <h3 className="scm-section-title">
                    <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
                    Section E: Review &amp; Confirmation
                  </h3>
                  <span className="scm-section-badge">Ready to Lodge</span>
                </div>

                <div className="scm-review-card">
                  <div className="scm-review-row">
                    <span className="scm-review-label">Confirmed Category:</span>
                    <span className="scm-review-val">
                      <strong>{category}</strong>
                      {aiResult?.collegeCategory && aiResult.collegeCategory !== category && (
                        <span style={{ fontSize: '0.74rem', color: '#7c3aed', marginLeft: '6px' }}>
                          (Overrode AI: {aiResult.collegeCategory})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="scm-review-row">
                    <span className="scm-review-label">Location:</span>
                    <span className="scm-review-val">{constructedLocation}</span>
                  </div>
                  <div className="scm-review-row">
                    <span className="scm-review-label">Priority:</span>
                    <span className="scm-review-val">{priority}</span>
                  </div>
                  <div className="scm-review-row">
                    <span className="scm-review-label">Photo Attached:</span>
                    <span className="scm-review-val">
                      {imageFile ? `✓ ${imageFile.name} (${(imageFile.size / 1024).toFixed(0)} KB)` : 'None (Text Only)'}
                    </span>
                  </div>
                  <div className="scm-review-row">
                    <span className="scm-review-label">Routing Workflow:</span>
                    <span className="scm-review-val" style={{ color: '#15803d' }}>
                      {aiResult?.needsReview
                        ? 'Supervisor Triage Queue (Manual Review)'
                        : `Auto-allocated to least-loaded ${category.toLowerCase()} technician`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="smart-complaint-footer">
              <div className="scm-footer-left">
                <button
                  type="button"
                  className="scm-btn-secondary"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  Save Draft
                </button>
                {draftSavedMessage && (
                  <span className="scm-draft-status">{draftSavedMessage}</span>
                )}
              </div>

              <div className="scm-footer-right">
                <button
                  type="button"
                  className="scm-btn-secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="scm-btn-primary"
                  disabled={isSubmitting || aiStatus === 'ANALYZING' || (!title.trim() && !imagePreview)}
                >
                  {isSubmitting ? (
                    <>
                      <Clock size={16} className="scm-spin" /> Lodging Complaint...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Submit Maintenance Complaint
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
