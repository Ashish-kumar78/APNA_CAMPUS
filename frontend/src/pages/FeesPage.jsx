import { useEffect, useState } from 'react'
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  DollarSign, 
  ArrowUpRight,
  ShieldAlert,
  Wallet,
  History,
  Calendar,
  Layers,
  FileCheck,
  X,
  UploadCloud,
  FileText,
  Eye,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Building2,
  Copy,
  Check,
  Maximize2
} from 'lucide-react'
import { openPaymentProofPdf, downloadPaymentProofPdf, convertNumberToIndianWords } from '../utils/pdfGenerator'
import { feesApi } from '../services/feesApi'
import './FeesPage.css'

export const yearlyFeeLedger = [];
export const feeHistory = [];

export function GiftReceiptPaperView({ receipt, studentName, studentRoll, studentCourseBatch, studentSection }) {
  const r = receipt || {}
  const regd = r.rollNumber || r.registrationNumber || studentRoll || '—'
  const name = (r.studentName || studentName || 'Student').toUpperCase()
  const batch = r.courseBatch || studentCourseBatch || '—'
  const sec = r.section || studentSection || '—'
  const recNo = r.receiptNo || 'Not issued — pending Accounts review'
  const recDate = r.paymentDate || r.receiptDate || r.date || '—'
  const amt = Number(r.amount || 0)
  const mode = r.paymentMethod || r.mode || '—'
  const txn = r.transactionId || r.txnId || '—'
  const head = r.head || r.remarks || '—'
  const words = convertNumberToIndianWords(amt)

  return (
    <div style={{
      position: 'relative',
      background: '#ffffff',
      border: '1.5px solid #000000',
      borderRadius: '2px',
      padding: '22px 26px',
      color: '#000000',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      textAlign: 'left',
      boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      {/* Central Watermark */}
      <div style={{
        position: 'absolute',
        top: '52%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.12,
        pointerEvents: 'none',
        zIndex: 0,
        textAlign: 'center'
      }}>
        <img src="/gift_logo.svg" alt="Watermark" style={{ width: '220px', height: '220px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <img src="/gift_logo.svg" alt="GIFT Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '1.22rem', fontWeight: 800, color: '#000000', lineHeight: 1.2 }}>
              APNA CAMPUS
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#000000', marginTop: '2px' }}>
              Payment Review
            </div>
            <div style={{ fontSize: '0.82rem', color: '#333333', marginTop: '2px' }}>
              Student payment proof workflow
            </div>
          </div>
        </div>

        {/* Solid Line */}
        <div style={{ width: '100%', height: '1.5px', background: '#000000', margin: '8px 0 10px' }}></div>

        {/* Centered Title */}
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.96rem', color: '#000000', marginBottom: '12px' }}>
          Payment Proof Submission Copy
        </div>

        {/* 2-Column Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '7px 16px', fontSize: '0.85rem', color: '#000000', marginBottom: '14px' }}>
          <div>
            <strong>Regd. No : </strong> {regd}
          </div>
          <div>
            <strong>No. : </strong> {recNo}
          </div>
          <div>
            <strong>Name : </strong> {name}
          </div>
          <div>
            <strong>Payment Date : </strong> {recDate}
          </div>
          <div>
            <strong>Course/Batch: </strong> {batch}
          </div>
          <div></div>
          <div>
            <strong>Section: </strong> {sec}
          </div>
          <div></div>
        </div>

        {/* Statement */}
        <div style={{ fontSize: '0.87rem', color: '#000000', lineHeight: 1.6, marginBottom: '12px' }}>
          Submitted payment claim for <strong>₹{amt.toLocaleString('en-IN')}</strong> (<em>{words}</em>) by {mode}, transaction id {txn}, dated {recDate}, from {name} towards <strong>{head}</strong>.
        </div>

        {/* Solid Line */}
        <div style={{ width: '100%', height: '1.5px', background: '#000000', margin: '10px 0' }}></div>

        {/* Disclaimer */}
        <div style={{ fontSize: '0.73rem', color: '#222222', lineHeight: 1.45 }}>
          This is not an official receipt and does not confirm that funds were received. The claim remains pending until Accounts reviews and approves the proof. A verified receipt is issued only after approval.
        </div>
      </div>
    </div>
  )
}

export default function FeesPage({ account }) {
  const studentName = account?.student?.name || account?.name || 'Student'
  const studentRoll = account?.student?.rollNumber || account?.rollNumber || account?.registrationNumber || '—'
  const studentCourseBatch = account?.student?.program || account?.program || account?.courseBatch || '—'
  const studentSection = account?.student?.section || account?.section || '—'

  const [activeTab, setActiveTab] = useState('current')
  const [showYearlyModal, setShowYearlyModal] = useState(false)

  // Feature 1: Upload Payment Proof State
  const [showProofModal, setShowProofModal] = useState(false)
  const [proofHistory, setProofHistory] = useState([])
  const [proofHistoryLoading, setProofHistoryLoading] = useState(true)
  const [proofHistoryError, setProofHistoryError] = useState('')
  const [proofStep, setProofStep] = useState('form') // 'form' | 'preview'
  const [submittingProof, setSubmittingProof] = useState(false)
  const [selectedProofView, setSelectedProofView] = useState(null)

  // Bank & QR Details State
  // Form inputs
  const [formAmount, setFormAmount] = useState('')
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0])
  const [formMethod, setFormMethod] = useState('UPI')
  const [formTxnId, setFormTxnId] = useState('')
  const [formRefNo, setFormRefNo] = useState('')
  const [formRemarks, setFormRemarks] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState('')
  const [fileTypeError, setFileTypeError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [toastMessage, setToastMessage] = useState('')

  // Load digital payment proof history
  useEffect(() => {
    loadPaymentProofs()
  }, [])

  const loadPaymentProofs = async () => {
    try {
      setProofHistoryLoading(true)
      setProofHistoryError('')
      setProofHistory(await feesApi.getMyPaymentProofs())
    } catch (error) {
      setProofHistory([])
      setProofHistoryError(error?.message || 'Could not load payment proof history.')
    } finally {
      setProofHistoryLoading(false)
    }
  }

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileTypeError('')
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    const maxBytes = 5 * 1024 * 1024 // 5 MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setFileTypeError('Invalid file type. Supported formats: JPG, JPEG, PNG, WEBP, PDF.')
      triggerToast('Invalid file type! Only images and PDFs are allowed.')
      return
    }

    if (file.size > maxBytes) {
      setFileTypeError('File size exceeds the 5MB allowed limit.')
      triggerToast('File size exceeds the 5MB allowed limit.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (evt) => setFilePreviewUrl(evt.target.result)
    reader.readAsDataURL(file)
  }

  // Form Validation & Proceed to Preview
  const handleProceedToPreview = (e) => {
    e.preventDefault()
    const errors = {}

    const amt = Number(formAmount)
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Amount must be greater than zero.'
    }
    if (!formDate) {
      errors.date = 'Payment date is required.'
    }
    if (!formMethod) {
      errors.method = 'Payment method must be selected.'
    }
    if (!formTxnId.trim()) {
      errors.txnId = 'Transaction ID / UTR Number is required.'
    }
    if (!selectedFile) {
      errors.file = 'Please upload your transaction proof.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      triggerToast(Object.values(errors)[0])
      return
    }

    setFormErrors({})
    setProofStep('preview')
  }

  // Submit Payment Proof
  const handleSubmitProof = async () => {
    if (submittingProof) return
    setSubmittingProof(true)

    const payload = {
      amount: formAmount,
      paymentDate: formDate,
      paymentMethod: formMethod,
      transactionId: formTxnId.trim(),
      referenceNumber: formRefNo.trim() || undefined,
      remarks: formRemarks.trim(),
      head: formRemarks.trim() || 'Payment proof submission',
      fileData: filePreviewUrl,
      fileName: selectedFile ? selectedFile.name : 'proof.png',
      fileType: selectedFile ? selectedFile.type : 'image/png',
    }

    try {
      const res = await feesApi.uploadPaymentProof(payload)
      if (res && res.success) {
        triggerToast('Payment proof submitted for Accounts review. It becomes a verified payment only after approval.')
        await loadPaymentProofs()
        setShowProofModal(false)
        resetProofForm()
        setActiveTab('proofs')
      }
    } catch (error) {
      triggerToast(error?.message || 'Failed to submit payment proof. Please try again.')
    } finally {
      setSubmittingProof(false)
    }
  }

  const handleViewProof = async (item) => {
    setSelectedProofView({ ...item, attachmentLoading: true, attachmentError: '' })
    try {
      const attachment = await feesApi.getPaymentProofFile(item.id)
      setSelectedProofView((current) => current?.id === item.id
        ? { ...current, ...attachment, attachmentLoading: false }
        : current)
    } catch (error) {
      setSelectedProofView((current) => current?.id === item.id
        ? { ...current, attachmentLoading: false, attachmentError: error?.message || 'The submitted file could not be loaded.' }
        : current)
    }
  }

  const resetProofForm = () => {
    setProofStep('form')
    setFormAmount('')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormMethod('UPI')
    setFormTxnId('')
    setFormRefNo('')
    setFormRemarks('')
    setSelectedFile(null)
    setFilePreviewUrl('')
    setFileTypeError('')
    setFormErrors({})
  }

  const handleDownload = (id) => {
    triggerToast(`Official student receipt ${id} is unavailable until fee statements are implemented.`)
  }

  const handleDownloadConsolidatedStatement = () => {
    triggerToast('Consolidated statements are unavailable until official fee assessments are configured.')
  }

  const getStatusBadge = (status) => {
    const st = (status || '').toUpperCase()
    if (st === 'APPROVED' || st === 'VERIFIED') {
      return <span className="fee-badge paid"><CheckCircle2 size={12} /> ✓ Payment Verified</span>
    }
    if (st === 'REJECTED') {
      return <span className="fee-badge partial" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}><X size={12} /> ✕ Payment Rejected</span>
    }
    return <span className="fee-badge partial" style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fcd34d' }}><Clock size={12} /> ⏳ Pending Verification</span>
  }

  return (
    <div className="fees-page">
      {toastMessage && (
        <div className="fees-toast" role="alert">
          <AlertCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="fees-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/gift_logo.svg" alt="GIFT Autonomous Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          <div>
            <h1 className="fees-title" style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a' }}>
              Gandhi Institute for Technology (GIFT) <span style={{ fontSize: '1.02rem', color: '#0284c7' }}>(Autonomous)</span>
            </h1>
            <p className="fees-subtitle" style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.84rem' }}>
              At- Gramadiha, P.o- Gangapada &bull; Student Fee Receipts &amp; Accounts Portal
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn-receipt"
            style={{ background: '#e0e7ff', borderColor: '#6366f1', color: '#4338ca', padding: '10px 16px', fontSize: '0.86rem', fontWeight: 700 }}
            onClick={() => {
              resetProofForm()
              setShowProofModal(true)
            }}
          >
            <UploadCloud size={17} />
            <span>Upload Payment Proof</span>
          </button>
          <button 
            type="button"
            className="btn-receipt"
            style={{ background: '#ffffff', borderColor: '#6366f1', color: '#4338ca', padding: '10px 16px', fontSize: '0.86rem' }}
            onClick={() => setShowYearlyModal(true)}
          >
            <History size={16} />
            <span>Year-Wise Statement</span>
          </button>
          <button className="btn-pay-now" disabled title="A payment gateway and official fee assessment are not configured.">
            <CreditCard size={18} />
            <span>Online Payment Unavailable</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="fees-metrics">
        {/* Card 1: Overall Paid 4-Years */}
        <div 
          className="fee-metric-card interactive" 
          onClick={() => setShowYearlyModal(true)}
          title="Click to view complete year-by-year fee breakdown"
          style={{ border: '1.5px solid #818cf8', background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)' }}
        >
          <div className="fee-metric-icon indigo"><History size={24} /></div>
          <div className="fee-metric-body" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <h4>Overall Paid</h4>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>
                All Years
              </span>
            </div>
            <div className="fee-val" style={{ color: '#4338ca' }}>Not configured</div>
            <div className="fee-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontWeight: 600 }}>
              <span>Official assessments are unavailable</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total College Fee */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon blue"><DollarSign size={24} /></div>
          <div className="fee-metric-body">
            <h4>Total Assessed</h4>
            <div className="fee-val">Not configured</div>
            <div className="fee-sub">No official assessment is available</div>
          </div>
        </div>

        {/* Card 3: Paid Amount */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon green"><CheckCircle2 size={24} /></div>
          <div className="fee-metric-body">
            <h4>Verified Collections</h4>
            <div className="fee-val">Open proof history</div>
            <div className="fee-sub">Use the Digital Payment Proofs tab</div>
          </div>
        </div>

        {/* Card 4: Pending Amount */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon amber"><Clock size={24} /></div>
          <div className="fee-metric-body">
            <h4>Pending Balance</h4>
            <div className="fee-val" style={{ color: '#d97706' }}>Not configured</div>
            <div className="fee-sub">No official due dates are available</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="fees-tabs">
        <button 
          className={`fee-tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Semester Invoices
        </button>
        <button 
          className={`fee-tab-btn ${activeTab === 'proofs' ? 'active' : ''}`}
          onClick={() => setActiveTab('proofs')}
        >
          Digital Payment Proofs ({proofHistory.length})
        </button>
        <button 
          className={`fee-tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => setActiveTab('yearly')}
        >
          Year-Wise Ledger (1st Year to Date)
        </button>
        <button 
          className={`fee-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Consolidated Payment Receipts
        </button>
        <button 
          className={`fee-tab-btn ${activeTab === 'bank-qr' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank-qr')}
        >
          Bank &amp; QR Details
        </button>
      </div>

      {/* Tab 1: Current Invoices */}
      {activeTab === 'current' && (
        <div className="fees-section-card">
          <div className="fee-sec-header">
            <h3>Current Fee Assessments</h3>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Official assessments are unavailable</span>
          </div>

          <div className="fee-table-wrap">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Semester / Session</th>
                  <th>Fee Head</th>
                  <th>Total Invoiced</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Payment Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No official fee assessment data is configured yet.</td></tr>
                ) : feeHistory.map((row) => (
                    <tr key={row.id}>
                      <td><strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{row.id}</strong></td>
                      <td>{row.term}</td>
                      <td>{row.head}</td>
                      <td><strong>₹{row.amount.toLocaleString('en-IN')}</strong></td>
                      <td>₹{row.paid.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`fee-badge ${row.status.toLowerCase()}`}>
                          {row.status === 'Paid' && <CheckCircle2 size={12} />}
                          {row.status === 'Partial' && <AlertCircle size={12} />}
                          {row.status}
                        </span>
                      </td>
                      <td><small style={{ color: '#64748b' }}>{row.mode}</small></td>
                      <td>
                        <button className="btn-receipt" onClick={() => handleDownload(row.id)}>
                          <Download size={14} />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Digital Payment Proofs (FEATURE 1) */}
      {activeTab === 'proofs' && (
        <div className="fees-section-card">
          <div className="fee-sec-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>Uploaded Payment Proofs & Digital Verification Tracker</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Track proofs submitted to Accounts. A pending claim is not a verified payment or official receipt.
              </p>
            </div>
            <button 
              type="button" 
              className="btn-pay-now" 
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => {
                resetProofForm()
                setShowProofModal(true)
              }}
            >
              <UploadCloud size={16} /> Upload New Proof
            </button>
          </div>

          {proofHistoryLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>Loading payment proof history…</div>
          ) : proofHistoryError ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#b91c1c' }} role="alert">{proofHistoryError}</div>
          ) : proofHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <UploadCloud size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h4>No payment proofs uploaded yet</h4>
              <p style={{ fontSize: '0.88rem' }}>Submit a payment proof for Accounts review. Only Accounts can verify that funds were received.</p>
              <button 
                type="button" 
                className="btn-receipt"
                style={{ marginTop: '12px', display: 'inline-flex', gap: '6px' }}
                onClick={() => {
                  resetProofForm()
                  setShowProofModal(true)
                }}
              >
                Upload Payment Proof
              </button>
            </div>
          ) : (
            <div className="fee-table-wrap">
              <table className="fee-table">
                <thead>
                  <tr>
                    <th>Proof ID</th>
                    <th>Payment Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Transaction ID / UTR</th>
                    <th>Verification Status</th>
                    <th>Submitted At</th>
                    <th>Action / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {proofHistory.map((item) => (
                    <tr key={item.id}>
                      <td><strong style={{ fontFamily: 'monospace', color: '#4338ca' }}>{item.id}</strong></td>
                      <td>{item.paymentDate}</td>
                      <td><strong style={{ color: '#0f172a' }}>₹{Number(item.amount).toLocaleString('en-IN')}</strong></td>
                      <td><span style={{ fontSize: '0.78rem', background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>{item.paymentMethod}</span></td>
                      <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{item.transactionId}</code></td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td><small style={{ color: '#64748b' }}>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '—'}</small></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button"
                            className="btn-receipt" 
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                            onClick={() => handleViewProof(item)}
                          >
                            <Eye size={13} /> View Proof
                          </button>
                          {item.status === 'REJECTED' && item.rejectionReason && (
                            <span 
                              title={`Rejection Reason: ${item.rejectionReason}`}
                              style={{ cursor: 'pointer', color: '#dc2626', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <AlertTriangle size={15} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Year-Wise Ledger */}
      {activeTab === 'yearly' && (
        <div className="fees-section-card">
          <div className="fee-sec-header">
            <div>
              <h3>Year-Wise Fee Statement</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Official fee assessments and due dates have not been configured, so a certified statement is unavailable.
              </p>
            </div>
            <button className="btn-receipt" onClick={handleDownloadConsolidatedStatement}>
              <Download size={14} />
              Consolidated Statement PDF
            </button>
          </div>

          <div className="fee-table-wrap">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Session</th>
                  <th>Semesters</th>
                  <th>Total Dues</th>
                  <th>Amount Paid</th>
                  <th>Outstanding</th>
                  <th>Clearance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {yearlyFeeLedger.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No official fee assessment data is configured yet.</td></tr>
                ) : yearlyFeeLedger.map((row) => (
                  <tr key={row.year} style={{ background: row.year.includes('Current') ? '#fffdfa' : '#ffffff' }}>
                    <td><strong style={{ color: '#0f172a', fontWeight: 700 }}>{row.year}</strong></td>
                    <td style={{ color: '#475569' }}>{row.session}</td>
                    <td><span style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>{row.semesters}</span></td>
                    <td><strong>₹{row.totalDue.toLocaleString('en-IN')}</strong></td>
                    <td style={{ color: '#059669', fontWeight: 700 }}>₹{row.amountPaid.toLocaleString('en-IN')}</td>
                    <td style={{ color: row.outstanding > 0 ? '#d97706' : '#64748b', fontWeight: row.outstanding > 0 ? 700 : 500 }}>
                      ₹{row.outstanding.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: row.percent, height: '100%', background: row.outstanding === 0 ? '#10b981' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>{row.percent}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`fee-badge ${row.outstanding === 0 ? 'paid' : 'partial'}`}>
                        {row.outstanding === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Receipts */}
      {activeTab === 'history' && (
        <div className="fees-section-card">
          <div className="fee-sec-header">
            <h3>Official Fee Receipts</h3>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Student statement integration is unavailable</span>
          </div>

          <div className="fee-table-wrap">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Semester / Session</th>
                  <th>Fee Head</th>
                  <th>Total Invoiced</th>
                  <th>Paid Amount</th>
                  <th>Status</th>
                  <th>Payment Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Official receipts are not available through the student statement yet.</td></tr>
                ) : feeHistory.map((row) => (
                  <tr key={row.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{row.id}</strong></td>
                    <td>{row.term}</td>
                    <td>{row.head}</td>
                    <td><strong>₹{row.amount.toLocaleString('en-IN')}</strong></td>
                    <td>₹{row.paid.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`fee-badge ${row.status.toLowerCase()}`}>
                        {row.status === 'Paid' && <CheckCircle2 size={12} />}
                        {row.status === 'Partial' && <AlertCircle size={12} />}
                        {row.status}
                      </span>
                    </td>
                    <td><small style={{ color: '#64748b' }}>{row.mode}</small></td>
                    <td>
                      <button className="btn-receipt" onClick={() => handleDownload(row.id)}>
                        <Download size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Payment Details */}
      {activeTab === 'bank-qr' && (
        <div className="fees-section-card" role="status">
          <div className="fee-sec-header">
            <h3>Payment Instructions</h3>
          </div>
          <p style={{ color: '#64748b' }}>
            Official bank account details, UPI QR code, and online payment gateway are not configured. Contact the Accounts office for verified payment instructions before transferring funds.
          </p>
        </div>
      )}

      {/* MODAL 1: Upload Payment Proof Modal (FEATURE 1) */}
      {showProofModal && (
        <div className="payment-modal-backdrop" onClick={() => setShowProofModal(false)}>
          <div className="payment-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowProofModal(false)}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="fee-metric-icon indigo" style={{ width: '38px', height: '38px' }}><UploadCloud size={20} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>Upload Payment Proof</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Submit UPI, Bank Transfer or Challan screenshot for Accounts verification
                </p>
              </div>
            </div>

            {proofStep === 'form' ? (
              <form onSubmit={handleProceedToPreview}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Payment Amount (₹) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input 
                      type="number"
                      min="1"
                      className="fee-input"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="e.g. 12000"
                      required
                    />
                    {formErrors.amount && <small style={{ color: '#dc2626' }}>{formErrors.amount}</small>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Payment Date <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input 
                      type="date"
                      className="fee-input"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                    {formErrors.date && <small style={{ color: '#dc2626' }}>{formErrors.date}</small>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Payment Method <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select 
                      className="fee-input"
                      value={formMethod}
                      onChange={(e) => setFormMethod(e.target.value)}
                      required
                    >
                      <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Bank Transfer">Bank Transfer (IMPS / Account)</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                      <option value="Other">Other / Bank Challan</option>
                    </select>
                    {formErrors.method && <small style={{ color: '#dc2626' }}>{formErrors.method}</small>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Transaction ID / UTR Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input 
                      type="text"
                      className="fee-input"
                      value={formTxnId}
                      onChange={(e) => setFormTxnId(e.target.value)}
                      placeholder="e.g. UPI9823471029 or UTR..."
                      required
                    />
                    {formErrors.txnId && <small style={{ color: '#dc2626' }}>{formErrors.txnId}</small>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Reference Number (Optional)
                    </label>
                    <input 
                      type="text"
                      className="fee-input"
                      value={formRefNo}
                      onChange={(e) => setFormRefNo(e.target.value)}
                      placeholder="e.g. REF-2026-98"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Remarks / Purpose
                    </label>
                    <input 
                      type="text"
                      className="fee-input"
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      placeholder="e.g. Sem 7 tuition fee partial"
                    />
                  </div>
                </div>

                {/* File Upload Zone */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Upload Transaction Screenshot / PDF <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      id="payment-proof-file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="payment-proof-file" style={{ cursor: 'pointer', display: 'block' }}>
                      <UploadCloud size={32} style={{ color: '#6366f1', marginBottom: '6px' }} />
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedFile ? selectedFile.name : 'Click or drag & drop payment proof'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                        Supported formats: JPG, JPEG, PNG, WEBP, PDF · Max size: 5MB
                      </div>
                    </label>
                  </div>
                  {fileTypeError && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{fileTypeError}</div>}
                  {formErrors.file && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '4px' }}>{formErrors.file}</div>}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                  <button type="button" className="btn-receipt" onClick={() => setShowProofModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-pay-now" style={{ padding: '8px 20px' }}>
                    Preview Proof & Details →
                  </button>
                </div>
              </form>
            ) : (
              /* Payment proof submission preview */
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} color="#d97706" /> Payment Proof Submission Preview
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                      Pending Accounts review
                    </span>
                  </div>

                  <GiftReceiptPaperView
                    receipt={{
                      amount: formAmount,
                      paymentDate: formDate,
                      paymentMethod: formMethod,
                      transactionId: formTxnId,
                      referenceNumber: formRefNo,
                      remarks: formRemarks || 'Payment proof submission',
                      rollNumber: studentRoll,
                      studentName: studentName,
                      courseBatch: studentCourseBatch,
                      section: studentSection
                    }}
                    studentName={studentName}
                    studentRoll={studentRoll}
                    studentCourseBatch={studentCourseBatch}
                    studentSection={studentSection}
                  />

                  {/* Uploaded Counterfoil Attachment Thumbnail */}
                  {filePreviewUrl && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Uploaded Payment Counterfoil: <strong>{selectedFile?.name || 'receipt_proof.jpg'}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => openPaymentProofPdf({
                          amount: formAmount,
                          paymentDate: formDate,
                          paymentMethod: formMethod,
                          transactionId: formTxnId,
                          referenceNumber: formRefNo,
                          remarks: formRemarks || 'Payment proof submission',
                          studentName,
                          rollNumber: studentRoll,
                          courseBatch: studentCourseBatch,
                          section: studentSection
                        })}
                        style={{ border: 'none', background: 'transparent', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={13} /> Open PDF Preview ↗
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ background: '#eff6ff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: '#1e40af', marginBottom: '14px', border: '1px solid #bfdbfe' }}>
                  ℹ️ This summary records details you submitted. Accounts must independently verify the transaction before payment is posted to the register.
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn-receipt"
                    onClick={() => setProofStep('form')}
                  >
                    ← Edit Details / Uploaded File
                  </button>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-receipt"
                      style={{ background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}
                      onClick={() => openPaymentProofPdf({
                        amount: formAmount,
                        paymentDate: formDate,
                        paymentMethod: formMethod,
                        transactionId: formTxnId,
                        referenceNumber: formRefNo,
                        remarks: formRemarks || 'Payment proof submission',
                        studentName,
                        rollNumber: studentRoll,
                        courseBatch: studentCourseBatch,
                        section: studentSection
                      })}
                    >
                      <ExternalLink size={14} /> Open Submission Summary ↗
                    </button>
                    <button 
                      type="button" 
                      className="btn-pay-now"
                      onClick={handleSubmitProof}
                      disabled={submittingProof}
                    >
                      {submittingProof ? 'Submitting…' : 'Submit for Accounts Review'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: View the submitted payment proof */}
      {selectedProofView && (
        <div className="payment-modal-backdrop" onClick={() => setSelectedProofView(null)}>
          <div className="payment-modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setSelectedProofView(null)}>×</button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="#0284c7" />
                Payment Proof Submission
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => openPaymentProofPdf(selectedProofView)}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <ExternalLink size={14} /> Open Submission Summary ↗
                </button>
                <button
                  type="button"
                  onClick={() => downloadPaymentProofPdf(selectedProofView)}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Download size={14} /> Download Submission Summary
                </button>
              </div>
            </div>

            <div style={{ maxHeight: '65vh', overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
              <GiftReceiptPaperView
                receipt={selectedProofView}
                studentName={selectedProofView.studentName || studentName}
                studentRoll={selectedProofView.rollNumber || studentRoll}
                studentCourseBatch={selectedProofView.courseBatch || studentCourseBatch}
                studentSection={selectedProofView.section || studentSection}
              />

              <div style={{ marginTop: '12px', minHeight: '120px', display: 'grid', placeItems: 'center', background: '#0f172a', borderRadius: '8px', padding: '12px' }}>
                {selectedProofView.attachmentLoading ? (
                  <span style={{ color: '#fff' }}>Loading submitted file…</span>
                ) : selectedProofView.attachmentError ? (
                  <span style={{ color: '#fecaca' }} role="alert">{selectedProofView.attachmentError}</span>
                ) : selectedProofView.fileData?.startsWith('data:image/') ? (
                  <img src={selectedProofView.fileData} alt="Submitted payment proof" style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain' }} />
                ) : selectedProofView.fileType === 'application/pdf' && selectedProofView.fileData ? (
                  <iframe title="Submitted payment proof PDF" src={selectedProofView.fileData} style={{ width: '100%', height: '55vh', border: 0, background: '#fff' }} />
                ) : (
                  <span style={{ color: '#cbd5e1' }}>The original proof attachment is unavailable.</span>
                )}
              </div>

              {/* Status details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
                <div><strong>Transaction ID:</strong> <code style={{ color: '#0284c7' }}>{selectedProofView.transactionId}</code></div>
                <div><strong>Verification Status:</strong> {getStatusBadge(selectedProofView.status)}</div>
                <div><strong>Payment Method:</strong> {selectedProofView.paymentMethod || '—'}</div>
                <div><strong>Value Date:</strong> {selectedProofView.paymentDate}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="button" className="btn-receipt" onClick={() => setSelectedProofView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Overall Paid from 1st Year Modal */}
      {showYearlyModal && (
        <div className="payment-modal-backdrop" onClick={() => setShowYearlyModal(false)}>
          <div className="payment-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowYearlyModal(false)}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="fee-metric-icon indigo" style={{ width: '38px', height: '38px' }}><History size={20} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Year-Wise Statement Unavailable</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Official fee assessments and due dates have not been configured.</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', borderRadius: '12px', padding: '16px 20px', margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ margin: 0, color: '#e0e7ff' }}>Paid totals, balances, and historical receipts cannot be shown until official fee assessments and student statements are implemented.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {yearlyFeeLedger.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center' }}>No official year-wise fee records are available.</p>
              ) : yearlyFeeLedger.map((y) => (
                <div key={y.year} style={{ padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{y.year}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '8px' }}>({y.session})</span>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#475569' }}>{y.details}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: y.outstanding === 0 ? '#059669' : '#d97706' }}>
                      ₹{y.amountPaid.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: y.outstanding === 0 ? '#059669' : '#d97706' }}>
                      {y.outstanding === 0 ? '✓ 100% Cleared' : '₹12,000 Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                type="button" 
                className="btn-pay-now" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleDownloadConsolidatedStatement}
              >
                <Download size={16} /> Statement unavailable
              </button>
              <button 
                type="button" 
                className="btn-receipt" 
                style={{ padding: '10px 18px' }}
                onClick={() => setShowYearlyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

