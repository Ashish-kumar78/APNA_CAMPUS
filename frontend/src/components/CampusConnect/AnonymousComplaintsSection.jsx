import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Lock, CheckCircle2, Search, AlertCircle, Clock,
  FileText, ShieldCheck, ChevronRight, Copy, Check, Sparkles,
  Paperclip, Info, AlertTriangle, UserCheck
} from 'lucide-react';
import { complaintsApi } from '../../services/complaintsApi';

const GRIEVANCE_CATEGORIES = [
  { value: 'TEACHING_RELATED', label: 'Teaching-related Concerns', example: 'Lecture delivery, pacing, topic clarity' },
  { value: 'FACULTY_BEHAVIOR', label: 'Faculty Behavior & Communication', example: 'Consultation availability, professional communication' },
  { value: 'COURSE_MATERIAL', label: 'Course Material & Syllabus Resources', example: 'Lab manuals, lecture notes, textbook references' },
  { value: 'MARKS_AND_ASSESSMENTS', label: 'Marks, Assessments & Examinations', example: 'Evaluation fairness, quiz rubrics, grading discrepancies' },
  { value: 'CLASSROOM_ENVIRONMENT', label: 'Classroom & Academic Environment', example: 'Projector, lab equipment, computing environment' },
  { value: 'OTHER_ACADEMIC', label: 'Other Academic Grievances', example: 'Timetable clashes, tutorial schedules, compensatory lectures' }
];

const FACULTY_MEMBERS = [
  { name: 'Dr. S. Mohanty', department: 'Computer Science & Engineering', designation: 'Associate Professor & Course Coordinator' },
  { name: 'Prof. R. K. Sahoo', department: 'Computer Science & Engineering', designation: 'Assistant Professor' },
  { name: 'Prof. S. K. Swain', department: 'Computer Science & Engineering', designation: 'Assistant Professor' },
  { name: 'Prof. B. Panda', department: 'Computer Science & Engineering', designation: 'Assistant Professor & Mentor' },
  { name: 'Dr. P. Mohapatra', department: 'Computer Science & Engineering', designation: 'Professor' }
];

export default function AnonymousComplaintsSection() {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track'
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [newComplaintGenerated, setNewComplaintGenerated] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    category: 'TEACHING_RELATED',
    facultyName: 'Dr. S. Mohanty',
    semester: 'Semester 5',
    section: 'Section A',
    subjectCode: 'CS501',
    subjectName: 'Data Structures & Algorithms',
    subject: '',
    description: '',
    attachmentUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      alert('Please fill in the subject and detailed description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await complaintsApi.submitComplaint({
        category: form.category,
        facultyName: form.facultyName,
        semester: form.semester,
        section: form.section,
        subjectCode: form.subjectCode,
        subjectName: form.subjectName,
        subject: form.subject.trim(),
        description: form.description.trim(),
        attachmentUrl: form.attachmentUrl || null
      });

      setNewComplaintGenerated(res);
      setForm({
        category: 'TEACHING_RELATED',
        facultyName: 'Dr. S. Mohanty',
        semester: 'Semester 5',
        section: 'Section A',
        subjectCode: 'CS501',
        subjectName: 'Data Structures & Algorithms',
        subject: '',
        description: '',
        attachmentUrl: ''
      });
    } catch (err) {
      alert(err.message || 'Failed to submit grievance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError('');
    if (!searchTrackingId.trim()) return;

    try {
      const found = await complaintsApi.trackComplaint(searchTrackingId.trim());
      if (found) {
        setTrackedComplaint(found);
      } else {
        setTrackedComplaint(null);
        setTrackError(`No complaint found with Tracking ID "${searchTrackingId.trim()}". Please verify and try again.`);
      }
    } catch (err) {
      setTrackedComplaint(null);
      setTrackError(err.message || `No complaint found with tracking ID "${searchTrackingId.trim()}".`);
    }
  };

  const copyTrackingId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div style={{ background: '#0b0f19', minHeight: '620px', borderRadius: 16, padding: '24px', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Anonymous Student Complaint &amp; Grievance Cell</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Report academic and faculty concerns with 100% cryptographic identity masking. Follow up securely using your generated Tracking ID.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: 6, background: '#111827', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            style={{
              background: activeTab === 'submit' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
              color: activeTab === 'submit' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('submit')}
          >
            Submit Grievance
          </button>
          <button
            type="button"
            style={{
              background: activeTab === 'track' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'transparent',
              color: activeTab === 'track' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('track')}
          >
            Track by ID
          </button>
        </div>
      </div>

      {/* Security Reassurance Callout */}
      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <ShieldCheck size={26} color="#34d399" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.45 }}>
          <strong style={{ color: '#34d399' }}>Zero-Knowledge Student Privacy:</strong> Your name, roll number, and email address are never disclosed to faculty members or the HOD. Submissions are processed without fear of retaliation.
          <div style={{ color: '#fef08a', marginTop: '4px', fontSize: '0.78rem' }}>
            💡 <em>Important: Please avoid writing your own name, phone number, or roll number in the complaint description if you wish to remain strictly anonymous.</em>
          </div>
        </div>
      </div>

      {/* TAB 1: SUBMIT GRIEVANCE */}
      {activeTab === 'submit' && (
        <div>
          {newComplaintGenerated ? (
            <div style={{ background: '#131c2e', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 14, padding: '24px', textAlign: 'center', maxWidth: 560, margin: '20px auto' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#fff' }}>Grievance Successfully Registered</h3>
              <p style={{ margin: '0 0 18px 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                Your grievance has been submitted anonymously to the concerned faculty and Head of Department. Please save your Tracking ID:
              </p>

              <div style={{ background: '#0b0f19', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em' }}>
                  {newComplaintGenerated.trackingId}
                </span>
                <button
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
                  onClick={() => copyTrackingId(newComplaintGenerated.trackingId)}
                >
                  {copiedId ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setNewComplaintGenerated(null)}
                >
                  Submit Another Grievance
                </button>
                <button
                  type="button"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    setSearchTrackingId(newComplaintGenerated.trackingId);
                    setActiveTab('track');
                    handleTrack({ preventDefault: () => {} });
                    setNewComplaintGenerated(null);
                  }}
                >
                  Track Live Status →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                    Complaint Category *
                  </label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    {GRIEVANCE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>
                    Concerned Faculty Member *
                  </label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.facultyName}
                    onChange={e => setForm({ ...form, facultyName: e.target.value })}
                  >
                    {FACULTY_MEMBERS.map(fac => (
                      <option key={fac.name} value={fac.name}>{fac.name} ({fac.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class, Cohort, Subject */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Semester</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                  >
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 7">Semester 7</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Section</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.section}
                    onChange={e => setForm({ ...form, section: e.target.value })}
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Subject / Course</label>
                  <select
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                    value={form.subjectCode}
                    onChange={e => {
                      const code = e.target.value;
                      const name = code === 'CS502' ? 'Operating Systems' : code === 'CS504' ? 'Design & Analysis of Algorithms' : 'Data Structures & Algorithms';
                      setForm({ ...form, subjectCode: code, subjectName: name });
                    }}
                  >
                    <option value="CS501">CS501 - Data Structures</option>
                    <option value="CS502">CS502 - Operating Systems</option>
                    <option value="CS504">CS504 - Algorithms</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Subject / Issue Title *</label>
                <input
                  type="text"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="Concise summary of the problem (e.g. Request for slower pacing in Dynamic Programming lectures)..."
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Detailed Grievance Description *</label>
                <textarea
                  rows={5}
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
                  placeholder="Describe the issue constructively: date, topic, assessment question, or specific difficulty experienced. (Reminder: avoid writing your personal identity to remain anonymous)."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase' }}>Optional Supporting Document / Resource Link</label>
                <input
                  type="text"
                  style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: '0.85rem' }}
                  placeholder="Link to question paper screenshot, problem sheet, or reference document (optional)..."
                  value={form.attachmentUrl}
                  onChange={e => setForm({ ...form, attachmentUrl: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(15, 118, 110, 0.35)', marginTop: 8 }}
              >
                <Lock size={16} /> {isSubmitting ? 'Securing Submission...' : 'Submit Grievance Anonymously'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: TRACK BY TRACKING ID */}
      {activeTab === 'track' && (
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              style={{ flex: 1, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: '0.9rem' }}
              placeholder="Enter your Tracking ID (e.g. CMP-2026-4821)..."
              value={searchTrackingId}
              onChange={e => setSearchTrackingId(e.target.value)}
            />
            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={16} /> Track Status
            </button>
          </form>

          {trackError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: '0.82rem' }}>
              {trackError}
            </div>
          )}

          {trackedComplaint ? (
            <div style={{ background: '#131c2e', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Tracking ID: {trackedComplaint.trackingId}
                  </span>
                  <h3 style={{ margin: '4px 0 2px', fontSize: '1.1rem', color: '#fff' }}>{trackedComplaint.subject}</h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Concerned Faculty: <strong>{trackedComplaint.facultyName}</strong> · Cohort: {trackedComplaint.semester} ({trackedComplaint.section})
                  </div>
                </div>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                  {trackedComplaint.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Status Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, background: '#0b0f19', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { step: 'NEW', label: 'Submitted', num: 1 },
                  { step: 'UNDER_REVIEW', label: 'Under Review', num: 2 },
                  { step: 'RESPONSE_SUBMITTED', label: 'Faculty Responded', num: 3 },
                  { step: 'RESOLVED', label: 'Resolved', num: 4 }
                ].map((s) => {
                  const statusOrder = ['NEW', 'UNDER_REVIEW', 'RESPONSE_SUBMITTED', 'AWAITING_HOD_REVIEW', 'RESOLVED'];
                  const curIdx = statusOrder.indexOf(trackedComplaint.status);
                  const isCurrentOrPast = curIdx >= statusOrder.indexOf(s.step);

                  return (
                    <div key={s.step} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isCurrentOrPast ? '#10b981' : '#334155',
                        color: isCurrentOrPast ? '#fff' : '#94a3b8',
                        margin: '0 auto 6px auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {isCurrentOrPast ? '✓' : s.num}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: isCurrentOrPast ? '#34d399' : '#64748b', fontWeight: 600 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                <strong>Original Grievance Content:</strong>
                <p style={{ margin: '4px 0 0', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'pre-line' }}>
                  {trackedComplaint.description}
                </p>
              </div>

              {/* Faculty Responses */}
              {trackedComplaint.responses && trackedComplaint.responses.length > 0 && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: '14px' }}>
                  <strong style={{ fontSize: '0.76rem', color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '6px' }}>
                    <CheckCircle2 size={15} /> Official Faculty Response:
                  </strong>
                  {trackedComplaint.responses.map((resp, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                        By {resp.facultyName} ({resp.facultyDesignation || 'Faculty'}) on {new Date(resp.submittedAt).toLocaleDateString('en-IN')}
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '0.84rem', color: '#f0fdf4' }}>
                        {resp.responseComment}
                      </p>
                      {resp.proposedAction && (
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#bbf7d0', marginTop: '6px' }}>
                          <strong>Proposed Action:</strong> {resp.proposedAction}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* HOD Review Outcome */}
              {trackedComplaint.hodReviews && trackedComplaint.hodReviews.length > 0 && (
                <div style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.35)', borderRadius: 10, padding: '14px' }}>
                  <strong style={{ fontSize: '0.76rem', color: '#c4b5fd', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '4px' }}>
                    <ShieldCheck size={15} /> Head of Department Review Outcome:
                  </strong>
                  {trackedComplaint.hodReviews.map((rev, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '0.74rem', color: '#ddd6fe' }}>
                        Outcome: <strong>{rev.reviewOutcome}</strong> · Signed by {rev.hodName}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#f5f3ff' }}>
                        {rev.observations}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.85rem' }}>
              Enter your grievance Tracking ID above to review committee actions, response, and resolution timeline.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
