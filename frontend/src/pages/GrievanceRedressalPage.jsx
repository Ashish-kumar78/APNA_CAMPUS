import React from 'react'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import GrievanceRedressalSection from '../components/GrievanceRedressalSection.jsx'
import './FeedbackPage.css'

export default function GrievanceRedressalPage({ account, onBack }) {
  return (
    <div className="feedback-page-shell">
      <div className="feedback-breadcrumb-bar">
        <button
          type="button"
          className="feedback-back-btn"
          onClick={() => {
            if (onBack) onBack()
            else window.location.hash = 'dashboard'
          }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <span className="feedback-breadcrumb-path">
          <span>🏠</span> / <strong>Grievance Redressal</strong>
        </span>
      </div>

      <header className="feedback-top-card grievance-hero-card">
        <div className="feedback-top-main">
          <div className="feedback-badge-pill grievance-badge-pill">
            <ShieldAlert size={13} />
            <span>OFFICIAL STUDENT GRIEVANCE &amp; REDRESSAL CELL · AICTE/UGC COMPLIANT</span>
          </div>
          <h1>Grievance Redressal Portal</h1>
          <p className="feedback-top-desc">
            Lodge grievances, hostel concerns, academic issues, examination delays, or fee queries directly to the Autonomous Grievance Committee.
            Track investigation progress, review resolutions, and download formal PDF/Excel records.
          </p>
        </div>
      </header>

      <GrievanceRedressalSection studentAccount={account} />
    </div>
  )
}

