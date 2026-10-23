import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, MapPin, Plus, Send, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import './StudentGatePassSection.css';

function toDateTimeLocal(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function StudentGatePassSection({ residence }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    purposeType: 'Home Visit',
    destination: '',
    outDateTime: '',
    inDateTime: '',
    emergencyContact: '',
  });

  const loadPasses = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.getHostelGatePasses();
      setPasses(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setLoadError(error.message || 'Gate pass applications could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPasses(); }, [loadPasses]);

  const pendingCount = passes.filter((pass) => pass.status === 'Pending Warden Approval').length;
  const approvedCount = passes.filter((pass) => pass.status === 'Approved').length;
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submitApplication = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.createHostelGatePass({ ...form });
      setFeedback({ type: 'success', message: 'Your application was saved and is pending warden review.' });
      setFormOpen(false);
      setForm({ purposeType: 'Home Visit', destination: '', outDateTime: '', inDateTime: '', emergencyContact: '' });
      await loadPasses();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'The gate pass application was not saved.' });
    } finally {
      setSubmitting(false);
    }
  };

  const hasResidence = Boolean(residence?.hostelName && residence?.roomNumber);

  return (
    <section className="gate-pass-container" aria-labelledby="student-gate-pass-title">
      <header className="gate-pass-hero">
        <div className="gate-pass-hero-text">
          <h2 id="student-gate-pass-title"><ShieldCheck size={25} /> Hostel Gate Pass Applications</h2>
          <p>Submit a travel request for warden review. Parent and mentor verification are not yet connected to this system.</p>
        </div>
        <button
          type="button"
          className="gate-pass-apply-hero-btn"
          onClick={() => { setFeedback(null); setFormOpen((open) => !open); }}
          disabled={!hasResidence || loading || submitting}
        >
          <Plus size={17} /> Apply for Gate Pass
        </button>
      </header>

      {!hasResidence && <p role="status">A current hostel room allocation is required to request a gate pass.</p>}
      {feedback && (
        <div role={feedback.type === 'error' ? 'alert' : 'status'} className="gate-pass-feedback" data-type={feedback.type}>
          {feedback.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          {feedback.message}
        </div>
      )}
      {loadError && <p role="alert">{loadError}</p>}

      {formOpen && (
        <form onSubmit={submitApplication} className="gate-pass-application-form">
          <div className="gate-pass-residence-summary">
            <strong>{residence.hostelName}</strong>
            <span>Room {residence.roomNumber}{residence.bedNumber ? ` · ${residence.bedNumber}` : ''}</span>
          </div>
          <label>
            Purpose
            <select value={form.purposeType} onChange={setField('purposeType')} required>
              <option>Home Visit</option>
              <option>Medical Consultation</option>
              <option>Competitive Examination</option>
              <option>Placement Drive</option>
              <option>Family Function</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Destination
            <input value={form.destination} onChange={setField('destination')} maxLength={240} required />
          </label>
          <label>
            Departure
            <input type="datetime-local" min={toDateTimeLocal(new Date())} value={form.outDateTime} onChange={setField('outDateTime')} required />
          </label>
          <label>
            Expected return
            <input type="datetime-local" min={form.outDateTime || toDateTimeLocal(new Date())} value={form.inDateTime} onChange={setField('inDateTime')} required />
          </label>
          <label>
            Emergency contact (optional)
            <input type="tel" value={form.emergencyContact} onChange={setField('emergencyContact')} maxLength={32} />
          </label>
          <div className="gate-pass-form-notice">
            <AlertCircle size={17} /> This request does not confirm parent consent, mentor clearance, or an official gate pass. The server records the request and its warden review status.
          </div>
          <button type="submit" className="admin-action-btn-primary" disabled={submitting}>
            <Send size={15} /> {submitting ? 'Submitting…' : 'Submit for Warden Review'}
          </button>
        </form>
      )}

      <div className="gate-pass-stats-grid">
        <div className="gate-pass-stat-card"><Clock size={22} /><div><strong>{passes.length}</strong><span>Total applications</span></div></div>
        <div className="gate-pass-stat-card"><Clock size={22} /><div><strong>{pendingCount}</strong><span>Pending review</span></div></div>
        <div className="gate-pass-stat-card"><CheckCircle2 size={22} /><div><strong>{approvedCount}</strong><span>Approved</span></div></div>
      </div>

      {loading && <p role="status">Loading your gate pass applications…</p>}
      {!loading && !loadError && passes.length === 0 && <p>No gate pass applications are recorded for your account.</p>}
      <div className="gate-pass-list">
        {passes.map((pass) => (
          <article key={pass.id} className="gate-pass-record">
            <div className="gate-pass-record-header">
              <strong>{pass.purposeType || 'Gate pass request'} · {pass.status}</strong>
              <code>{pass.passId || pass.id}</code>
            </div>
            <div className="gate-pass-record-detail"><MapPin size={15} /> {pass.destination || 'Destination not recorded'}</div>
            <div>Residence: {pass.hostelName || 'Not recorded'} · Room {pass.roomNumber || 'Not recorded'}</div>
            <div>Departure: {formatDateTime(pass.outDateTime)} · Return: {formatDateTime(pass.inDateTime)}</div>
            <div>Mentor verification: {pass.mentorStatus || 'Not verified'} · Parent consent: {pass.parentConsentVerified ? 'Verified' : 'Not verified'}</div>
            {pass.wardenRemarks && <p>Warden note: {pass.wardenRemarks}</p>}
            {pass.actualExitTime && <div>Exit recorded: {pass.actualExitTime}</div>}
            {pass.actualReturnTime && <div>Return recorded: {pass.actualReturnTime}</div>}
          </article>
        ))}
      </div>
    </section>
  );
}
