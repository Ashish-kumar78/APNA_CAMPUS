import { useState } from 'react'
import { 
  CreditCard, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Share2, 
  Smartphone,
  CheckCircle2,
  Lock
} from 'lucide-react'
import { downloadIdCardPdf } from '../utils/pdfGenerator'
import './IDCardPage.css'

export default function IDCardPage() {
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleDownload = () => {
    downloadIdCardPdf({
      name: 'Aarav Sharma',
      rollNo: '2301289140',
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      semester: '7th Sem',
      bloodGroup: 'O+',
      rfidTag: 'RF-882194',
      hostel: 'Block C - 204'
    })
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 3000)
  }

  return (
    <div className="idcard-page">
      <div className="idcard-header">
        <div>
          <h1 className="idcard-title">Digital Campus Identity Card</h1>
          <p className="idcard-subtitle">Encrypted RFID Student Smart Pass for campus turnstiles, exams, library, and hostel access</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-receipt" onClick={() => alert('NFC Tap Simulation: Student identity verified at Campus Main Gate #1')}>
            <Smartphone size={16} />
            <span>Simulate NFC Tap</span>
          </button>
          <button className="btn-pay-now" onClick={handleDownload}>
            <Download size={16} />
            <span>Download Digital Pass (PDF)</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>High-resolution cryptographic student pass downloaded to your device!</span>
        </div>
      )}

      <div className="idcard-wrapper">
        <div className="idcard-badge-container">
          <div className="idcard-top-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', background: '#ffffff', borderRadius: '4px', padding: '2px' }} />
              <div>
                <div className="idcard-inst-name">APNA CAMPUS</div>
                <small style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Affiliated to BPUT, Odisha | NAAC 'A' Grade</small>
              </div>
            </div>
            <span className="idcard-validity">VALID: 2023 - 2027</span>
          </div>

          <div className="idcard-main-info">
            <div className="idcard-photo-box" style={{ padding: 0, overflow: 'hidden' }}>
              <img src="/passport_photo_male.svg" alt="Aarav Sharma" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="idcard-details">
              <h2 className="idcard-name">Aarav Sharma</h2>
              <div className="idcard-reg">REG NO: 2301289140</div>
              <div className="idcard-info-grid">
                <div><span>Course:</span> <strong>B.Tech</strong></div>
                <div><span>Branch:</span> <strong>CSE</strong></div>
                <div><span>Semester:</span> <strong>7th Sem</strong></div>
                <div><span>Blood Grp:</span> <strong style={{ color: '#f87171' }}>O+</strong></div>
                <div><span>RFID Tag:</span> <strong>RF-882194</strong></div>
                <div><span>Hostel:</span> <strong>Block C - 204</strong></div>
              </div>
            </div>
          </div>

          <div className="idcard-bottom-bar">
            <div>
              <div className="idcard-barcode">||| | |||| || ||| | |||</div>
              <small style={{ color: '#94a3b8', fontSize: '0.68rem' }}>2301289140-BPUT-2026</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#ffffff', padding: '4px', borderRadius: '6px', display: 'flex' }}>
                <QrCode size={40} color="#0a0f1e" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8' }}>CHIP ACTIVE</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Principal / Registrar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="idcard-instructions">
        <h4><ShieldCheck size={18} color="#2563eb" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Usage Rules & Security Guidelines</h4>
        <ul>
          <li>This digital identity card is universally recognized for campus entry, library book borrowing, and mess entry.</li>
          <li>For university end-semester examinations, carrying both the physical badge and this digital pass on your smartphone is accepted.</li>
          <li>In case of loss or theft of the physical RFID chip badge, report instantly to the Student Affairs Desk to block unauthorized access.</li>
          <li>NFC contactless turnstiles at Academic Blocks 1-4 and Hostels read this digital pass natively.</li>
        </ul>
      </div>
    </div>
  )
}
