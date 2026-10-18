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
  Award,
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
import { downloadFeeReceiptPdf, openFeeReceiptPdf, openPaymentProofPdf, downloadPaymentProofPdf, convertNumberToIndianWords } from '../utils/pdfGenerator'
import { feesApi } from '../services/feesApi'
import './FeesPage.css'

const COLLEGE_PAYMENT_QR_URL = '/college_payment_qr_placeholder.svg'

export const yearlyFeeLedger = [
  {
    year: '1st Year',
    session: 'Academic Session 2023–24',
    semesters: 'Semester 1 & 2',
    totalDue: 75000,
    amountPaid: 75000,
    outstanding: 0,
    status: 'Cleared',
    percent: '100%',
    receiptsCount: 2,
    details: 'Admission fee, 1st & 2nd semester academic packages, basic workshop & university registration'
  },
  {
    year: '2nd Year',
    session: 'Academic Session 2024–25',
    semesters: 'Semester 3 & 4',
    totalDue: 78400,
    amountPaid: 78400,
    outstanding: 0,
    status: 'Cleared',
    percent: '100%',
    receiptsCount: 2,
    details: 'Tuition fees, lab maintenance, university semester registration, development fee'
  },
  {
    year: '3rd Year',
    session: 'Academic Session 2025–26',
    semesters: 'Semester 5 & 6',
    totalDue: 82000,
    amountPaid: 82000,
    outstanding: 0,
    status: 'Cleared',
    percent: '100%',
    receiptsCount: 2,
    details: 'Specialization labs, cloud computing resources, mid-term & end-term examination fee'
  },
  {
    year: '4th Year (Current)',
    session: 'Academic Session 2026–27',
    semesters: 'Semester 7 & 8',
    totalDue: 89000,
    amountPaid: 77000,
    outstanding: 12000,
    status: 'Pending: ₹12,000',
    percent: '86.5%',
    receiptsCount: 4,
    details: 'Semester 7 tuition fee, library caution, university exams, hostel & mess charge (balance ₹12,000 due 30 Oct 2026)'
  }
];

export const feeHistory = [
  { id: 'TXN-98421', term: 'Semester 7 (4th Year)', head: 'Tuition & Development Fee', amount: 48500, paid: 48500, status: 'Paid', date: '12 Aug 2026', mode: 'Net Banking (HDFC)' },
  { id: 'TXN-98422', term: 'Semester 7 (4th Year)', head: 'Examination & University Reg.', amount: 3500, paid: 3500, status: 'Paid', date: '15 Aug 2026', mode: 'UPI' },
  { id: 'TXN-98423', term: 'Semester 7 (4th Year)', head: 'Hostel & Mess Charges', amount: 32000, paid: 20000, due: 12000, status: 'Partial', date: '20 Aug 2026', mode: 'Credit Card' },
  { id: 'TXN-98424', term: 'Semester 7 (4th Year)', head: 'Library & Laboratory Caution', amount: 5000, paid: 5000, status: 'Paid', date: '10 Aug 2026', mode: 'Challan' },
  { id: 'TXN-87211', term: 'Semester 6 (3rd Year)', head: 'Full Semester Academic Package', amount: 41000, paid: 41000, status: 'Paid', date: '18 Jan 2026', mode: 'Net Banking' },
  { id: 'TXN-76192', term: 'Semester 5 (3rd Year)', head: 'Full Semester Academic Package', amount: 41000, paid: 41000, status: 'Paid', date: '22 Jul 2025', mode: 'Net Banking' },
  { id: 'TXN-24751', term: 'Semester 4 (2nd Year)', head: 'Tuition & Examination Fee', amount: 39200, paid: 39200, status: 'Paid', date: '12 Jan 2025', mode: 'UPI' },
  { id: 'TXN-24103', term: 'Semester 3 (2nd Year)', head: 'Tuition & Development Fee', amount: 39200, paid: 39200, status: 'Paid', date: '10 Jul 2024', mode: 'Net Banking' },
  { id: 'TXN-23842', term: 'Semester 2 (1st Year)', head: 'Tuition & Laboratory Fee', amount: 35000, paid: 35000, status: 'Paid', date: '15 Jan 2024', mode: 'Net Banking' },
  { id: 'TXN-23011', term: 'Semester 1 (1st Year)', head: 'Admission & 1st Sem Tuition', amount: 40000, paid: 40000, status: 'Paid', date: '12 Aug 2023', mode: 'Online SBI' },
];

export function GiftReceiptPaperView({ receipt, studentName, studentRoll, studentCourseBatch, studentSection }) {
  const r = receipt || {}
  const regd = r.rollNumber || r.registrationNumber || studentRoll || '2401432265'
  const name = (r.studentName || studentName || 'BISHNU PRASAD SAHOO').toUpperCase()
  const batch = r.courseBatch || studentCourseBatch || 'BTECH 2028-P'
  const sec = r.section || studentSection || 'CSE (AI) - Genius'
  const rawNo = r.receiptNo || r.referenceNumber || (r.id ? String(r.id).replace(/\D/g, '') || '128680' : '128680')
  const recNo = String(rawNo).startsWith('GIFT/ACC') ? rawNo : `GIFT/ACC/${rawNo}`
  const recDate = r.paymentDate || r.receiptDate || r.date || '27-07-2026'
  const amt = Number(r.amount || 20000)
  const mode = r.paymentMethod || r.mode || 'Bank Transfer'
  const txn = r.transactionId || r.txnId || '126928800409'
  const head = r.head || r.remarks || 'Tuition Fee'
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
              Gandhi Institute for Technology (GIFT)
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#000000', marginTop: '2px' }}>
              (Autonomous)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#333333', marginTop: '2px' }}>
              At- Gramadiha, P.o- Gangapada
            </div>
          </div>
        </div>

        {/* Solid Line */}
        <div style={{ width: '100%', height: '1.5px', background: '#000000', margin: '8px 0 10px' }}></div>

        {/* Centered Title */}
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.96rem', color: '#000000', marginBottom: '12px' }}>
          Fees Receipt (Student Copy)
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
            <strong>Receipt Date : </strong> {recDate}
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
          Received <strong>RS. {amt.toLocaleString('en-IN')}.00</strong> (<em>{words}</em>) by {mode} transcation id-{txn} on {recDate} from {name} towards <strong>{head}</strong>.
        </div>

        {/* Solid Line */}
        <div style={{ width: '100%', height: '1.5px', background: '#000000', margin: '10px 0' }}></div>

        {/* Disclaimer */}
        <div style={{ fontSize: '0.73rem', color: '#222222', lineHeight: 1.45 }}>
          This money receipt is computer generated by the student through his/her CMS login and does not require the Accountant's signature or the Institute's stamp in order to be considered valid. This is a duplicate money receipt and the original receipt is available with Accounts Department.
        </div>
      </div>
    </div>
  )
}

export default function FeesPage({ account }) {
  const studentName = account?.name || 'BISHNU PRASAD SAHOO'
  const studentRoll = account?.rollNumber || account?.registrationNumber || '2401432265'
  const studentCourseBatch = 'BTECH 2028-P'
  const studentSection = 'CSE (AI) - Genius'

  const [activeTab, setActiveTab] = useState('current')
  const [showPayModal, setShowPayModal] = useState(false)
  const [showYearlyModal, setShowYearlyModal] = useState(false)
  const [selectedPayMode, setSelectedPayMode] = useState('upi')
  const [paidSuccess, setPaidSuccess] = useState(false)

  // Feature 1: Upload Payment Proof State
  const [showProofModal, setShowProofModal] = useState(false)
  const [proofHistory, setProofHistory] = useState([])
  const [proofStep, setProofStep] = useState('form') // 'form' | 'preview'
  const [submittingProof, setSubmittingProof] = useState(false)
  const [selectedProofView, setSelectedProofView] = useState(null)
  const [recentlyGeneratedReceipt, setRecentlyGeneratedReceipt] = useState(null)

  // Bank & QR Details State
  const [showEnlargedQr, setShowEnlargedQr] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  const handleCopyText = (fieldKey, text) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Form inputs
  const [formAmount, setFormAmount] = useState('12000')
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

  // Overall calculations
  const totalOverallPaid = yearlyFeeLedger.reduce((sum, item) => sum + item.amountPaid, 0)
  const totalOverallDues = yearlyFeeLedger.reduce((sum, item) => sum + item.totalDue, 0)
  const overallClearedPercent = ((totalOverallPaid / totalOverallDues) * 100).toFixed(1)

  // Load digital payment proof history
  useEffect(() => {
    loadFeeStatement()
  }, [])

  const loadFeeStatement = async () => {
    const data = await feesApi.getFeeStatement('2305201001')
    if (data && data.paymentHistory) {
      setProofHistory(data.paymentHistory)
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
      transactionId: formTxnId.trim() || '126928800409',
      referenceNumber: formRefNo.trim() || '128680',
      remarks: formRemarks.trim() || 'Tuition Fee',
      head: formRemarks.trim() || 'Tuition Fee',
      previewUrl: filePreviewUrl,
      fileName: selectedFile ? selectedFile.name : 'proof.png',
      fileType: selectedFile ? selectedFile.type : 'image/png',
      studentName,
      rollNumber: studentRoll,
      courseBatch: studentCourseBatch,
      section: studentSection,
      department: 'Computer Science & Engineering (Artificial Intelligence)'
    }

    try {
      const res = await feesApi.uploadPaymentProof(payload)
      if (res && res.success) {
        triggerToast('Payment receipt uploaded successfully! Generating GIFT Autonomous Fee Receipt...')
        await loadFeeStatement()
        setShowProofModal(false)
        resetProofForm()
        setActiveTab('proofs')
        setRecentlyGeneratedReceipt(payload)
      }
    } catch {
      triggerToast('Failed to submit payment proof. Please try again.')
    } finally {
      setSubmittingProof(false)
    }
  }

  const resetProofForm = () => {
    setProofStep('form')
    setFormAmount('20000')
    setFormDate(new Date().toISOString().split('T')[0])
    setFormMethod('Bank Transfer')
    setFormTxnId('')
    setFormRefNo('')
    setFormRemarks('Tuition Fee')
    setSelectedFile(null)
    setFilePreviewUrl('')
    setFileTypeError('')
    setFormErrors({})
  }

  const handlePay = () => {
    setPaidSuccess(true)
    setTimeout(() => {
      setPaidSuccess(false)
      setShowPayModal(false)
    }, 2000)
  }

  const handleDownload = (id) => {
    const row = feeHistory.find(item => item.id === id) || { id, amount: 20000, head: 'Tuition Fee', mode: 'Bank Transfer' }
    downloadFeeReceiptPdf(row, { name: studentName, rollNo: studentRoll, batch: studentCourseBatch, section: studentSection })
  }

  const handleDownloadConsolidatedStatement = () => {
    downloadFeeReceiptPdf({
      id: 'GIFT-CONS-FEE-2026',
      term: 'BTECH 2028-P (Consolidated Statement)',
      head: 'Tuition Fee Clearance Statement',
      amount: totalOverallDues,
      paid: totalOverallPaid,
      mode: 'Bank Transfer',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }, { name: studentName, rollNo: studentRoll, batch: studentCourseBatch, section: studentSection })
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
            <span>1st Yr to Date Statement</span>
          </button>
          <button className="btn-pay-now" onClick={() => setShowPayModal(true)}>
            <CreditCard size={18} />
            <span>Pay Outstanding (₹12,000)</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="fees-metrics">
        {/* Card 1: Total Fee */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon blue"><DollarSign size={24} /></div>
          <div className="fee-metric-body">
            <h4>Total College Fee</h4>
            <div className="fee-val">₹89,000</div>
            <div className="fee-sub">Semester 7 · Session 2026–27</div>
          </div>
        </div>

        {/* Card 2: Scholarship Amount */}
        <div className="fee-metric-card" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #bbf7d0' }}>
          <div className="fee-metric-icon green" style={{ background: '#dcfce7', color: '#15803d' }}><Award size={24} /></div>
          <div className="fee-metric-body">
            <h4>Scholarship Amount</h4>
            <div className="fee-val" style={{ color: '#15803d' }}>₹15,000</div>
            <div className="fee-sub" style={{ color: '#166534', fontWeight: 600 }}>PRERANA Post-Matric Grant</div>
          </div>
        </div>

        {/* Card 3: Paid Amount */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon green"><CheckCircle2 size={24} /></div>
          <div className="fee-metric-body">
            <h4>Paid Amount</h4>
            <div className="fee-val">₹77,000</div>
            <div className="fee-sub">86.5% cleared</div>
          </div>
        </div>

        {/* Card 4: Pending Amount */}
        <div className="fee-metric-card">
          <div className="fee-metric-icon amber"><Clock size={24} /></div>
          <div className="fee-metric-body">
            <h4>Pending Balance</h4>
            <div className="fee-val" style={{ color: '#d97706' }}>₹12,000</div>
            <div className="fee-sub">Due date: 30 Oct 2026</div>
          </div>
        </div>

        {/* Card 5: Overall Paid 4-Years */}
        <div 
          className="fee-metric-card interactive" 
          onClick={() => setShowYearlyModal(true)}
          title="Click to view complete year-by-year fee breakdown"
          style={{ border: '1.5px solid #818cf8', background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)' }}
        >
          <div className="fee-metric-icon indigo"><History size={24} /></div>
          <div className="fee-metric-body" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
              <h4>Overall Paid (4-Years)</h4>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>
                All Years
              </span>
            </div>
            <div className="fee-val" style={{ color: '#4338ca' }}>₹{totalOverallPaid.toLocaleString('en-IN')}</div>
            <div className="fee-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1', fontWeight: 600 }}>
              <span>{overallClearedPercent}% cleared</span> · <span>Details →</span>
            </div>
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
            <h3>Semester 7 Current Academic Invoices</h3>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Curated Accounts Ledger</span>
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
                {feeHistory
                  .filter(item => item.term.includes('Semester 7'))
                  .map((row) => (
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
                Track approval status of digital screenshots & bank transfer receipts submitted to the Accounts section.
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

          {proofHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <UploadCloud size={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <h4>No payment proofs uploaded yet</h4>
              <p style={{ fontSize: '0.88rem' }}>Upload your UPI or bank transfer screenshot to avoid visiting the Accounts section physically.</p>
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
                      <td><small style={{ color: '#64748b' }}>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Today'}</small></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button"
                            className="btn-receipt" 
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                            onClick={() => setSelectedProofView(item)}
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
              <h3>Cumulative Year-Wise Fee Breakdown (1st Year to Till Now)</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Complete certified financial ledger from admission session (2023) through current 4th Year (2026).
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
                {yearlyFeeLedger.map((row) => (
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
            <h3>All Past Transactions & Ledgers (1st Year to Till Now)</h3>
            <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Curated Accounts Ledger</span>
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
                {feeHistory.map((row) => (
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

      {/* Tab 5: Bank & QR Details */}
      {activeTab === 'bank-qr' && (
        <div className="bank-qr-grid">
          {/* Card 1: College Payment QR Code */}
          <div className="bank-qr-card">
            <div>
              <div className="bank-qr-header">
                <h3>
                  <QrCode size={20} color="#2563eb" /> Scan &amp; Pay College Fees
                </h3>
                <p>Unified UPI Gateway for Semester Fees, Caution Deposits &amp; Examination dues</p>
              </div>

              {/* QR Display Area */}
              <div className="qr-display-box">
                <div className="qr-image-container">
                  <img
                    src={COLLEGE_PAYMENT_QR_URL}
                    alt="Scan & Pay College Fees Official QR Code"
                    style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  />
                </div>
                <p className="qr-caption-text">
                  Scan this QR code using a supported UPI payment application.
                </p>
                <p className="qr-subcaption-text">
                  Supports Google Pay, PhonePe, Paytm, BHIM, Cred, and all UPI-enabled banking apps.
                </p>
              </div>

              {/* Buttons: Download QR Code & View QR Code */}
              <div className="qr-buttons-row">
                <a
                  href={COLLEGE_PAYMENT_QR_URL}
                  download="College_Payment_QR.svg"
                  className="btn-qr-action download"
                >
                  <Download size={15} /> Download QR Code
                </a>
                <button
                  type="button"
                  className="btn-qr-action view"
                  onClick={() => setShowEnlargedQr(true)}
                >
                  <Eye size={15} /> View QR Code
                </button>
              </div>
            </div>

            {/* Verification Reminder Note */}
            <div className="qr-reminder-box">
              <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Important Verification Reminder:</strong> Before authorizing the payment, always verify that the beneficiary name displays as <strong>"APNA CAMPUS / COLLEGE ACCOUNTS"</strong> in your UPI application.
              </div>
            </div>
          </div>

          {/* Card 2: Official College Bank Details */}
          <div className="bank-qr-card">
            <div>
              <div className="bank-qr-header">
                <h3>
                  <Building2 size={20} color="#2563eb" /> Official College Bank Details
                </h3>
                <p>Direct Electronic Fund Transfer via NEFT / RTGS / IMPS</p>
              </div>

              {/* Bank Details List */}
              <div className="bank-details-list">
                {/* Account Holder */}
                <div className="bank-detail-item">
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label">Account Holder / College Name</span>
                    <strong className="bank-detail-value">Apna Campus Autonomous College of Engineering &amp; Technology</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-copy-mini ${copiedField === 'holder' ? 'copied' : ''}`}
                    onClick={() => handleCopyText('holder', 'Apna Campus Autonomous College of Engineering & Technology')}
                    title="Copy Account Holder Name"
                  >
                    {copiedField === 'holder' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'holder' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Bank Name */}
                <div className="bank-detail-item">
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label">Bank Name</span>
                    <strong className="bank-detail-value">State Bank of India (SBI)</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-copy-mini ${copiedField === 'bank' ? 'copied' : ''}`}
                    onClick={() => handleCopyText('bank', 'State Bank of India')}
                    title="Copy Bank Name"
                  >
                    {copiedField === 'bank' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'bank' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Branch Name */}
                <div className="bank-detail-item">
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label">Branch Name</span>
                    <strong className="bank-detail-value">Campus Tech Complex Branch, Bhubaneswar</strong>
                  </div>
                </div>

                {/* Account Number */}
                <div className="bank-detail-item" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label" style={{ color: '#1d4ed8' }}>Account Number</span>
                    <strong className="bank-detail-value monospace">394200109842</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-copy-mini ${copiedField === 'accountNo' ? 'copied' : ''}`}
                    onClick={() => handleCopyText('accountNo', '394200109842')}
                    title="Copy Account Number"
                  >
                    {copiedField === 'accountNo' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'accountNo' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Account Type */}
                <div className="bank-detail-item">
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label">Account Type</span>
                    <strong className="bank-detail-value">Institutional Current Account</strong>
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="bank-detail-item" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label" style={{ color: '#1d4ed8' }}>IFSC Code</span>
                    <strong className="bank-detail-value monospace">SBIN0010234</strong>
                  </div>
                  <button
                    type="button"
                    className={`btn-copy-mini ${copiedField === 'ifsc' ? 'copied' : ''}`}
                    onClick={() => handleCopyText('ifsc', 'SBIN0010234')}
                    title="Copy IFSC Code"
                  >
                    {copiedField === 'ifsc' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Bank Address */}
                <div className="bank-detail-item">
                  <div className="bank-detail-meta">
                    <span className="bank-detail-label">Bank Address</span>
                    <strong className="bank-detail-value" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#475569' }}>
                      Academic Block B, Infocity Avenue, Patia, Bhubaneswar, Odisha – 751024
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bank-verified-badge">
                <ShieldCheck size={16} /> Verified Institutional Banking Partner
              </div>
            </div>

            {/* Instruction for upload */}
            <div className="bank-notice-card" style={{ marginTop: '16px' }}>
              <FileCheck size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Next Step After Transfer:</strong> After completing your transaction, note the <strong>UTR / Reference ID</strong> and upload your payment receipt in the <strong>"Digital Payment Proofs"</strong> tab above for automated accounts clearance.
              </div>
            </div>
          </div>
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
              /* FEATURE 1 — STEP 3: OFFICIAL GIFT FEE RECEIPT PREVIEW BEFORE SUBMIT */
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#16a34a" /> Official Fee Receipt Generation Preview
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 600 }}>
                      Image 5 Standard &bull; GIFT Autonomous
                    </span>
                  </div>

                  <GiftReceiptPaperView
                    receipt={{
                      amount: formAmount,
                      paymentDate: formDate,
                      paymentMethod: formMethod,
                      transactionId: formTxnId || '126928800409',
                      referenceNumber: formRefNo || '128680',
                      remarks: formRemarks || 'Tuition Fee',
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
                          transactionId: formTxnId || '126928800409',
                          referenceNumber: formRefNo || '128680',
                          remarks: formRemarks || 'Tuition Fee',
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
                  ℹ️ When submitted, the official <strong>GIFT Autonomous Fee Receipt (Student Copy) PDF</strong> matching Image 5 will be generated and ready for instant download and verification.
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
                        transactionId: formTxnId || '126928800409',
                        referenceNumber: formRefNo || '128680',
                        remarks: formRemarks || 'Tuition Fee',
                        studentName,
                        rollNumber: studentRoll,
                        courseBatch: studentCourseBatch,
                        section: studentSection
                      })}
                    >
                      <ExternalLink size={14} /> Open PDF ↗
                    </button>
                    <button 
                      type="button" 
                      className="btn-pay-now"
                      onClick={handleSubmitProof}
                      disabled={submittingProof}
                    >
                      {submittingProof ? 'Generating & Submitting...' : 'Submit & Generate Receipt PDF ✓'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: View Single Proof Details & GIFT Autonomous Money Receipt */}
      {selectedProofView && (
        <div className="payment-modal-backdrop" onClick={() => setSelectedProofView(null)}>
          <div className="payment-modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setSelectedProofView(null)}>×</button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="#0284c7" />
                GIFT Autonomous Money Receipt
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
                  <ExternalLink size={14} /> Open PDF ↗
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
                  <Download size={14} /> Download PDF
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

              {/* Status details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
                <div><strong>Transaction ID:</strong> <code style={{ color: '#0284c7' }}>{selectedProofView.transactionId}</code></div>
                <div><strong>Verification Status:</strong> {getStatusBadge(selectedProofView.status)}</div>
                <div><strong>Payment Method:</strong> {selectedProofView.paymentMethod || 'Bank Transfer'}</div>
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

      {/* MODAL 3: Recently Generated Receipt Success Dialog */}
      {recentlyGeneratedReceipt && (
        <div className="payment-modal-backdrop" onClick={() => setRecentlyGeneratedReceipt(null)}>
          <div className="payment-modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setRecentlyGeneratedReceipt(null)}>×</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                <Check size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#14532d' }}>Payment Receipt Uploaded &amp; PDF Generated!</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Your official money receipt matching Gandhi Institute for Technology (GIFT) Autonomous format is ready.
                </p>
              </div>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '14px', paddingRight: '4px' }}>
              <GiftReceiptPaperView
                receipt={recentlyGeneratedReceipt}
                studentName={recentlyGeneratedReceipt.studentName || studentName}
                studentRoll={recentlyGeneratedReceipt.rollNumber || studentRoll}
                studentCourseBatch={recentlyGeneratedReceipt.courseBatch || studentCourseBatch}
                studentSection={recentlyGeneratedReceipt.section || studentSection}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-receipt" 
                onClick={() => setRecentlyGeneratedReceipt(null)}
              >
                Close &amp; View Ledger
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    background: '#f0f9ff',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => openPaymentProofPdf(recentlyGeneratedReceipt)}
                >
                  <ExternalLink size={15} /> Open PDF in New Window ↗
                </button>
                <button
                  type="button"
                  className="btn-pay-now"
                  style={{ padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => downloadPaymentProofPdf(recentlyGeneratedReceipt)}
                >
                  <Download size={15} /> Download PDF Receipt (Image 5)
                </button>
              </div>
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Overall Amount Paid (1st Year to Till Now)</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Consolidated institutional fee ledger across all 4 undergraduate years.</p>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: '#ffffff', borderRadius: '12px', padding: '16px 20px', margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Cumulative Paid:</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>₹{totalOverallPaid.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: '#c7d2fe' }}>4-Year Program Demand:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e7ff' }}>₹{totalOverallDues.toLocaleString('en-IN')}</div>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>{overallClearedPercent}% Cleared</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {yearlyFeeLedger.map((y) => (
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
                <Download size={16} /> Download 4-Year Statement PDF
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

      {/* MODAL 4: Gateway Pay Modal */}
      {showPayModal && (
        <div className="payment-modal-backdrop" onClick={() => setShowPayModal(false)}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowPayModal(false)}>×</button>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Secure Dues Payment Gateway</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 16px' }}>
              Pending Hostel & Mess balance: <strong style={{ color: '#0a0f1e' }}>₹12,000</strong>
            </p>

            {paidSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: 0, color: '#065f46', fontSize: '1.2rem' }}>Payment Successful!</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>Generating digital receipt and clearing dues...</p>
              </div>
            ) : (
              <>
                <div className="pay-opts">
                  <div 
                    className={`pay-opt-btn ${selectedPayMode === 'upi' ? 'active' : ''}`}
                    onClick={() => setSelectedPayMode('upi')}
                  >
                    UPI / QR Code
                  </div>
                  <div 
                    className={`pay-opt-btn ${selectedPayMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setSelectedPayMode('cards')}
                  >
                    Debit / Credit Card
                  </div>
                  <div 
                    className={`pay-opt-btn ${selectedPayMode === 'netbanking' ? 'active' : ''}`}
                    onClick={() => setSelectedPayMode('netbanking')}
                  >
                    Net Banking
                  </div>
                  <div 
                    className={`pay-opt-btn ${selectedPayMode === 'challan' ? 'active' : ''}`}
                    onClick={() => setSelectedPayMode('challan')}
                  >
                    Bank Challan (Offline)
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '0.82rem', color: '#475569', marginBottom: '20px' }}>
                  256-Bit SSL Encrypted Transaction. Automatic ERP clearance receipt generated immediately.
                </div>

                <button 
                  className="btn-pay-now" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePay}
                >
                  Confirm & Pay ₹12,000
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: Enlarged QR Modal */}
      {showEnlargedQr && (
        <div className="payment-modal-backdrop" onClick={() => setShowEnlargedQr(false)}>
          <div className="payment-modal" style={{ maxWidth: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={() => setShowEnlargedQr(false)}>×</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
              <QrCode size={22} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Scan &amp; Pay College Fees</h3>
            </div>
            <div style={{ background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'inline-block', marginBottom: '14px' }}>
              <img 
                src={COLLEGE_PAYMENT_QR_URL} 
                alt="Scan & Pay College Fees Official QR Code" 
                style={{ width: '280px', height: '280px', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
              />
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, margin: '0 0 12px' }}>
              Scan this QR code using a supported UPI payment application.
            </p>
            <div className="qr-reminder-box" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.78rem' }}>
                Please verify recipient name as <strong>"APNA CAMPUS / COLLEGE ACCOUNTS"</strong> before confirming payment.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a 
                href={COLLEGE_PAYMENT_QR_URL} 
                download="College_Payment_QR.svg" 
                className="btn-qr-action download"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={15} /> Download QR Code
              </a>
              <button 
                type="button" 
                className="btn-qr-action view"
                style={{ padding: '8px 18px' }}
                onClick={() => setShowEnlargedQr(false)}
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

