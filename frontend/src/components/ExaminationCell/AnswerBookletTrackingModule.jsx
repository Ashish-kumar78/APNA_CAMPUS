import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  Eye,
  Check,
  X,
  FileSpreadsheet,
  FileCheck2,
  Barcode,
  ArrowRight,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';
import { examinationStore } from '../../services/examinationStore';

export default function AnswerBookletTrackingModule({ triggerToast }) {
  const [booklets, setBooklets] = useState(() => examinationStore.getBooklets());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooklet, setSelectedBooklet] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);

  const [updateForm, setUpdateForm] = useState({
    status: 'In Evaluation',
    location: '',
    handler: 'CoE Officer',
    note: ''
  });

  const filteredBooklets = useMemo(() => {
    return booklets.filter(b => {
      const matchSearch =
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.evaluatorAssigned && b.evaluatorAssigned.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || b.evaluationStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [booklets, searchQuery, statusFilter]);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    if (!updateModal) return;
    const updated = examinationStore.updateBookletStatus(
      updateModal.id,
      updateForm.status,
      updateForm.location || updateModal.currentLocation,
      updateForm.handler,
      updateForm.note || `Transitioned custody to ${updateForm.status}`
    );
    setBooklets([...examinationStore.getBooklets()]);
    if (selectedBooklet?.id === updateModal.id) {
      setSelectedBooklet(updated);
    }
    setUpdateModal(null);
    triggerToast(`Booklet bundle ${updated.id} custody updated.`);
  };

  const handleOpenUpdate = (b, e) => {
    e?.stopPropagation();
    setUpdateModal(b);
    setUpdateForm({
      status: b.evaluationStatus,
      location: b.currentLocation,
      handler: b.custodyHolder,
      note: ''
    });
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className="erp-stats-grid">
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Tracked Booklet Bundles</span>
            <Layers size={18} color="#7c3aed" />
          </div>
          <div className="erp-stat-val">{booklets.length} Bundles</div>
          <div className="erp-stat-note">{booklets.reduce((s, b) => s + b.totalScripts, 0)} Total Scripts Count</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">In Evaluation</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div className="erp-stat-val" style={{ color: '#d97706' }}>
            {booklets.filter(b => b.evaluationStatus === 'In Evaluation').length}
          </div>
          <div className="erp-stat-note">With external/internal evaluators</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Evaluated &amp; Verified</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div className="erp-stat-val" style={{ color: '#16a34a' }}>
            {booklets.filter(b => b.evaluationStatus === 'Evaluated').length}
          </div>
          <div className="erp-stat-note">Marks uploaded &amp; verified</div>
        </div>
        <div className="erp-stat-card">
          <div className="erp-stat-card-header">
            <span className="erp-stat-card-title">Strongroom Custody</span>
            <ShieldCheck size={18} color="#0284c7" />
          </div>
          <div className="erp-stat-val" style={{ color: '#0284c7' }}>
            {booklets.filter(b => b.evaluationStatus === 'In Strongroom').length}
          </div>
          <div className="erp-stat-note">Awaiting scanning / dispatch</div>
        </div>
      </div>

      <div className="erp-panel">
        <div className="erp-panel-header">
          <div className="erp-panel-title">
            <h3>Answer Sheet &amp; Booklet Custody Tracking Register</h3>
            <p>End-to-end chain of custody from examination hall receipt, digitization, evaluator dispatch to strongroom archival</p>
          </div>
        </div>

        <div className="exam-toolbar">
          <div className="exam-search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search by bundle ID, barcode, subject code, or evaluator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="exam-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Custody Statuses</option>
            <option value="In Strongroom">In Strongroom</option>
            <option value="In Evaluation">In Evaluation</option>
            <option value="Evaluated">Evaluated</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="erp-table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Bundle ID &amp; Barcode</th>
                <th>Subject &amp; Session</th>
                <th>Scripts &amp; Roll Range</th>
                <th>Current Custody &amp; Location</th>
                <th>Assigned Evaluator</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooklets.map(b => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.bundleNo}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      ID: <code>{b.id}</code> · Barcode: <code>{b.barcode}</code>
                    </div>
                  </td>
                  <td>
                    <strong>{b.subjectName}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Code: <code>{b.subjectCode}</code> · {b.examDate} ({b.session})
                    </div>
                  </td>
                  <td>
                    <strong>{b.totalScripts} Scripts</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.scriptsRange}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.currentLocation}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Holder: {b.custodyHolder}</div>
                  </td>
                  <td>
                    <div><strong>{b.evaluatorAssigned}</strong></div>
                    {b.dispatchDate && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Dispatched: {b.dispatchDate}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${
                      b.evaluationStatus === 'Evaluated' ? 'success' :
                      b.evaluationStatus === 'In Evaluation' ? 'warning' : 'info'
                    }`}>
                      {b.evaluationStatus}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      {b.verificationStatus}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="erp-btn erp-btn-outline erp-btn-sm"
                        onClick={() => setSelectedBooklet(b)}
                        title="View Movement Timeline"
                      >
                        <Eye size={13} /> Timeline
                      </button>
                      <button
                        className="erp-btn erp-btn-secondary erp-btn-sm"
                        onClick={(e) => handleOpenUpdate(b, e)}
                        title="Update Custody / Location"
                      >
                        <Truck size={13} /> Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW MOVEMENT TIMELINE */}
      {selectedBooklet && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card lg">
            <div className="exam-modal-header">
              <div>
                <h3>Chain of Custody &amp; Movement Audit Trail</h3>
                <p>Bundle: <code>{selectedBooklet.id}</code> · {selectedBooklet.subjectName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setSelectedBooklet(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="exam-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.84rem' }}>
                <div><strong>Barcode:</strong> <code>{selectedBooklet.barcode}</code></div>
                <div><strong>Total Scripts:</strong> {selectedBooklet.totalScripts} Scripts</div>
                <div><strong>Roll Range:</strong> {selectedBooklet.scriptsRange}</div>
                <div><strong>Digitized Scan:</strong> <code>{selectedBooklet.scannedDocRef}</code></div>
                <div><strong>Current Custody:</strong> <span style={{ fontWeight: 700, color: '#7c3aed' }}>{selectedBooklet.currentLocation}</span></div>
                <div><strong>Evaluator:</strong> {selectedBooklet.evaluatorAssigned}</div>
              </div>

              <h4 style={{ fontSize: '0.88rem', color: '#0f172a', margin: '0 0 12px' }}>CUSTODY LOG TIMELINE</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0' }}>
                {selectedBooklet.movementHistory.map((m, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.85rem',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#7c3aed',
                      border: '2px solid #ffffff'
                    }} />
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{m.from} &rarr; {m.to}</strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{m.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Officer in Charge: <strong>{m.handler}</strong>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: '#64748b' }}>{m.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="exam-modal-footer">
              <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setSelectedBooklet(null)}>
                Close
              </button>
              <button
                type="button"
                className="erp-btn erp-btn-primary"
                onClick={() => {
                  const b = selectedBooklet;
                  setSelectedBooklet(null);
                  handleOpenUpdate(b);
                }}
              >
                <Truck size={14} /> Update Custody Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE CUSTODY */}
      {updateModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-card">
            <div className="exam-modal-header">
              <div>
                <h3>Update Booklet Custody Status</h3>
                <p>Bundle: <code>{updateModal.id}</code> · {updateModal.subjectName}</p>
              </div>
              <button className="exam-modal-close-btn" onClick={() => setUpdateModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus}>
              <div className="exam-modal-body">
                <div className="exam-form-grid">
                  <div className="exam-form-group">
                    <label className="exam-form-label">Evaluation / Custody Status *</label>
                    <select
                      className="exam-form-select"
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    >
                      <option value="In Strongroom">In Strongroom Vault</option>
                      <option value="Digital Scanning">Digital Scanning Desk</option>
                      <option value="In Evaluation">Dispatched &amp; In Evaluation</option>
                      <option value="Evaluated">Evaluated &amp; Returned</option>
                      <option value="Scrutinized">Scrutinized &amp; Verified</option>
                      <option value="Archived">Archived in Secure Storage</option>
                    </select>
                  </div>
                  <div className="exam-form-group">
                    <label className="exam-form-label">New Physical Location *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      placeholder="e.g. CoE Central Evaluation Hall 2"
                      value={updateForm.location}
                      onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Receiving / Relinquishing Officer *</label>
                    <input
                      type="text"
                      className="exam-form-input"
                      required
                      value={updateForm.handler}
                      onChange={(e) => setUpdateForm({ ...updateForm, handler: e.target.value })}
                    />
                  </div>
                  <div className="exam-form-group full">
                    <label className="exam-form-label">Custody Handover Remarks / Audit Note</label>
                    <textarea
                      rows={3}
                      className="exam-form-textarea"
                      placeholder="e.g. Received intact with seal unbroken from courier dispatch."
                      value={updateForm.note}
                      onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="exam-modal-footer">
                <button type="button" className="erp-btn erp-btn-secondary" onClick={() => setUpdateModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="erp-btn erp-btn-primary">
                  <Check size={14} /> Record Custody Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
