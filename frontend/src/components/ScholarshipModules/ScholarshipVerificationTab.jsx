import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  RotateCcw,
  Upload,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  File
} from 'lucide-react';

export default function ScholarshipVerificationTab({
  documents,
  applications,
  onUpdateDocuments,
  onUpdateApplications,
  onAddAuditLog
}) {
  const [selectedSubtab, setSelectedSubtab] = useState('docs'); // 'docs' | 'screening' | 'discrepancy'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, doc: null, reason: '' });
  const [overrideModal, setOverrideModal] = useState({ open: false, app: null, criterion: '', justification: '' });

  // Filter documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.docType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.appId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' ? true : d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleVerifyDoc = (docId) => {
    const updated = documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'Verified',
          reviewer: 'Dr. M. K. Mohapatra',
          remarks: 'Officially verified against state gazette & digital repository.'
        };
      }
      return d;
    });

    onUpdateDocuments(updated);

    const docObj = documents.find(d => d.id === docId);
    onAddAuditLog({
      actionType: 'DOCUMENT_VERIFIED',
      target: `${docObj?.appId} (${docObj?.studentName} - ${docObj?.docType})`,
      details: 'Marked as verified with digital stamp and validation check.'
    });
  };

  const handleConfirmDocReject = () => {
    if (!rejectionModal.doc) return;
    const updated = documents.map(d => {
      if (d.id === rejectionModal.doc.id) {
        return {
          ...d,
          status: 'Rejected',
          reviewer: 'Dr. M. K. Mohapatra',
          remarks: rejectionModal.reason
        };
      }
      return d;
    });

    onUpdateDocuments(updated);

    onAddAuditLog({
      actionType: 'DOCUMENT_REJECTED',
      target: `${rejectionModal.doc.appId} (${rejectionModal.doc.studentName} - ${rejectionModal.doc.docType})`,
      details: `Document rejected. Reason: ${rejectionModal.reason}`
    });

    setRejectionModal({ open: false, doc: null, reason: '' });
  };

  const handleConfirmOverride = () => {
    if (!overrideModal.app || !overrideModal.justification) return;

    onAddAuditLog({
      actionType: 'ELIGIBILITY_CRITERIA_OVERRIDDEN',
      target: `${overrideModal.app.id} (${overrideModal.app.studentName})`,
      details: `Manual administrative override on [${overrideModal.criterion}]. Justification: ${overrideModal.justification}`
    });

    setOverrideModal({ open: false, app: null, criterion: '', justification: '' });
  };

  return (
    <div className="scholarship-module-wrap">
      {/* Verification Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSubtab('docs')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'docs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Supporting Document Review ({documents.length})
          </button>
          <button
            onClick={() => setSelectedSubtab('screening')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'screening'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Eligibility Screening Checklist
          </button>
          <button
            onClick={() => setSelectedSubtab('discrepancy')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              selectedSubtab === 'discrepancy'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Discrepancy Management (2 Alerts)
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Authorized Verification Officer: <strong className="text-slate-800">Mr. P. C. Behera / Dr. M. K. Mohapatra</strong>
        </div>
      </div>

      {/* Subtab 1: Document Review Queue */}
      {selectedSubtab === 'docs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search document title, candidate name, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
              >
                <option value="All">All Verification Statuses</option>
                <option value="Verified">Verified Only</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Document Title & Filename</th>
                  <th className="py-3 px-4">Student & Application</th>
                  <th className="py-3 px-4">Declared Value</th>
                  <th className="py-3 px-4">Validity / Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reviewer Remarks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{doc.docType}</div>
                      <div className="text-[11px] text-blue-600 font-mono flex items-center gap-1 mt-0.5">
                        <FileText size={12} /> {doc.fileName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{doc.studentName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{doc.appId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{doc.declaredAmount}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-medium ${
                        doc.expiryDate.includes('Expired') ? 'text-rose-600 font-bold' : 'text-slate-600'
                      }`}>
                        {doc.expiryDate}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        doc.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status === 'Verified' ? <CheckCircle2 size={12} /> :
                         doc.status === 'Rejected' ? <XCircle size={12} /> :
                         <Clock size={12} />}
                        {doc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-[200px] text-slate-600 truncate" title={doc.remarks}>
                      {doc.remarks}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] flex items-center gap-1"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                        {doc.status !== 'Verified' && (
                          <button
                            onClick={() => handleVerifyDoc(doc.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px]"
                          >
                            Verify
                          </button>
                        )}
                        {doc.status !== 'Rejected' && (
                          <button
                            onClick={() => setRejectionModal({ open: true, doc, reason: '' })}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-700 font-semibold rounded text-[11px]"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Eligibility Screening Checklist */}
      {selectedSubtab === 'screening' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start justify-between">
            <div>
              <span className="font-bold text-sm block mb-1">Standard Institutional Screening Matrix</span>
              <p>
                Each candidate must meet the configured criteria for the academic year. Officers can review evidence and invoke an administrative override with mandatory justification.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
              RULE ENGINE ACTIVE
            </span>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 4).map(app => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{app.studentName}</span>
                    <span className="text-xs text-slate-500 ml-2 font-mono">({app.id} · {app.dept})</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    app.eligibilityStatus.includes('Ineligible') ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {app.eligibilityStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Minimum CGPA</span>
                    <strong className="text-slate-800">{app.cgpa} CGPA</strong>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">≥ 7.00 Required</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Annual Family Income</span>
                    <strong className="text-slate-800">₹{app.annualFamilyIncome.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Threshold: ≤ ₹2.50L</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Attendance Compliance</span>
                    <strong className="text-emerald-700">89.2% Recorded</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Threshold: ≥ 75.0%</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Administrative Action</span>
                    <button
                      onClick={() => setOverrideModal({ open: true, app, criterion: 'Academic CGPA Criteria', justification: '' })}
                      className="text-xs text-blue-600 font-bold hover:underline text-left mt-1"
                    >
                      Override Screening Result →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Discrepancy Management */}
      {selectedSubtab === 'discrepancy' && (
        <div className="space-y-3">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
            <span className="font-bold text-sm block mb-1">Flagged Application Discrepancies</span>
            Immediate action required. Discrepant applications remain locked until corrected certificates are provided.
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="p-3 border border-rose-200 bg-rose-50/50 rounded-lg flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs">Alok Kumar Jena (APP-2026-087 · Mechanical)</span>
                <p className="text-xs text-rose-800 mt-1">
                  <strong>Discrepancy:</strong> Submitted revenue income certificate expired on 31 March 2025. Academic CGPA is 6.20 against 7.00 threshold.
                </p>
                <div className="text-[11px] text-slate-500 mt-1">Flagged on 01 Oct 2026 by Mr. P. C. Behera</div>
              </div>
              <button
                onClick={() => setRejectionModal({
                  open: true,
                  doc: { id: 'DOC-VER-105', appId: 'APP-2026-087', studentName: 'Alok Kumar Jena', docType: 'Income Certificate' },
                  reason: 'Expired certificate and below CGPA cutoff.'
                })}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold text-xs"
              >
                Issue Notice
              </button>
            </div>

            <div className="p-3 border border-amber-200 bg-amber-50/50 rounded-lg flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs">Sourav Panigrahi (APP-2026-084 · CSE)</span>
                <p className="text-xs text-amber-800 mt-1">
                  <strong>Discrepancy:</strong> Bank Aadhaar NPCI mapper link unconfirmed. Student requested to visit bank branch to enable DBT seeding.
                </p>
                <div className="text-[11px] text-slate-500 mt-1">Flagged on 14 Sep 2026</div>
              </div>
              <button
                onClick={() => alert('DBT SMS Reminder dispatched to Sourav Panigrahi (+91 94370 20040).')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs"
              >
                Send DBT Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Demonstration Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-emerald-400" />
                <span className="font-bold text-sm">{previewDoc.docType}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-xs space-y-4 overflow-y-auto">
              {/* Mock Document Visual */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <File size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{previewDoc.fileName}</h4>
                  <p className="text-slate-500 text-[11px]">Demonstration Document Repository Container</p>
                </div>
                <div className="inline-block bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] font-mono text-slate-600">
                  SHA-256 Checksum: 8f9b4c02...e138a · Verified Clean
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Student</span>
                  <strong className="text-slate-800">{previewDoc.studentName}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Application</span>
                  <strong className="text-slate-800">{previewDoc.appId}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Upload Timestamp</span>
                  <strong className="text-slate-800">{previewDoc.uploadDate}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Certificate Validity</span>
                  <strong className="text-slate-800">{previewDoc.expiryDate}</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                <span className="font-bold block mb-0.5">Verification Officer Assessment:</span>
                {previewDoc.remarks}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Close Preview
              </button>
              {previewDoc.status !== 'Verified' && (
                <button
                  onClick={() => {
                    handleVerifyDoc(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                >
                  Confirm Verification Stamp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Document Rejection Modal */}
      {rejectionModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-3.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-600">
              <AlertTriangle size={18} /> Reject Document & Request Re-upload
            </h4>
            <p className="text-xs text-slate-600">
              Please state why <strong>{rejectionModal.doc?.docType}</strong> submitted for {rejectionModal.doc?.studentName} was rejected:
            </p>
            <textarea
              rows="3"
              placeholder="e.g. Barcode illegible, document expired on 31 March 2025, or seal missing..."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-rose-500"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModal({ open: false, doc: null, reason: '' })}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDocReject}
                disabled={!rejectionModal.reason.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-md"
              >
                Confirm Document Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Eligibility Override Modal */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-3.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-purple-600">
              <ShieldCheck size={18} /> Administrative Eligibility Override
            </h4>
            <p className="text-xs text-slate-600">
              Executive authority override for <strong>{overrideModal.app?.studentName}</strong> on criterion: <strong>{overrideModal.criterion}</strong>.
            </p>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Mandatory Regulatory Justification (Recorded in Audit Trail)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Special institutional discretion granted per Dean Welfare recommendation dated 12 Oct..."
                value={overrideModal.justification}
                onChange={(e) => setOverrideModal({ ...overrideModal, justification: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-purple-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOverrideModal({ open: false, app: null, criterion: '', justification: '' })}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={!overrideModal.justification.trim()}
                className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-md"
              >
                Apply Executive Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
