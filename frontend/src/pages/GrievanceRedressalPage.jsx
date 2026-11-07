import React from 'react'
import { ShieldAlert } from 'lucide-react'
import GrievanceRedressalSection from '../components/GrievanceRedressalSection.jsx'
import './FeedbackPage.css'

export default function GrievanceRedressalPage({ account }) {
  return (
    <div className="feedback-page-shell">
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

