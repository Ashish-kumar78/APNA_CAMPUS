import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  Building2,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  Filter,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import './OfficialCollegeNotice.css';

export const GIFT_MODULAR_TEST_2_NOTICE = {
  id: 'CIRC-GIFT-MOD2-2026',
  circularNo: 'GIFT/COE/2026/MOD2-01',
  title: 'B.Tech 5th Semester Modular test-II schedule, 2026',
  authority: 'CONTROLLER OF EXAMINATION (GIFT)',
  email: 'exam@gift.edu.in',
  date: '04 Nov 2026',
  duration: '05 November 2026 to 12 November 2026',
  timeSlot: '8:30 am to 9:30 am',
  recipients: 'btech2024-28, GIFT, Deans, HODS, GANDHI, Bhubaneswar, COE, Sasrnita, Roma',
  intro: 'Dear Students,\nThe Modular Test -II for B.Tech 5th Semester will be conducted from 05 November 2026 to 12 November 2026 as per the schedule given below:\nAll students are advised to take note of the schedule and prepare accordingly.',
  heading: 'B.Tech-5th-semester Modular Test-II, November 2026',
  branches: [
    {
      name: 'B. Tech (CSE)',
      code: 'CSE',
      badge: 'Computer Science',
      color: '#4f46e5',
      subjects: [
        { code: 'BTCS-T-PC-505', name: 'Artificial Intelligence and Computational Foundations', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-502', name: 'Software Engineering', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-503', name: 'Operating System', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-504', name: 'Formal Language and Automata Theory', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-501', name: 'Web Design and Development', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-501', name: 'Essence of Indian Knowledge & Tradition-II', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (CSE-AI)',
      code: 'CSE-AI',
      badge: 'AI & Data Science',
      color: '#7c3aed',
      subjects: [
        { code: 'BTCA-T-PC-505', name: 'Foundations of Artificial Intelligence', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-502', name: 'Software Engineering', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-503', name: 'Operating System', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-504', name: 'Formal Language and Automata Theory', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTCA-T-PE-501', name: 'Digital Image Processing', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-501', name: 'Essence of Indian Knowledge & Tradition-II', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (CS & IOT)',
      code: 'CS-IOT',
      badge: 'IoT & Cybernetics',
      color: '#0891b2',
      subjects: [
        { code: 'BTCA-T-PC-505', name: 'Foundations of Artificial Intelligence', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-502', name: 'Software Engineering', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-503', name: 'Operating System', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTCS-T-PC-504', name: 'Formal Language and Automata Theory', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PC-503', name: 'Microprocessor and Microcontroller', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-501', name: 'Essence of Indian Knowledge & Tradition-II', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (CIVIL)',
      code: 'CIVIL',
      badge: 'Civil Engineering',
      color: '#059669',
      subjects: [
        { code: 'BTCE-T-PC-501', name: 'Design of Concrete Structure', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTCE-T-PC-503', name: 'Structural Analysis-II', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTCE-T-PE-501', name: 'Foundation Engineering', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTCE-T-OE-501', name: 'Green Technology', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTCE-T-PC-502', name: 'Water and Waste Water Engineering', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-511', name: 'Universal Human Values', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (ECE)',
      code: 'ECE',
      badge: 'Electronics & Comm',
      color: '#ea580c',
      subjects: [
        { code: 'BTEC-T-PE-502', name: 'Control System', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PC-502', name: 'Digital Signal Processing', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PC-501', name: 'Analog Communication', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PE-501', name: 'Mobile Communication', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PC-503', name: 'Microprocessor and Microcontroller', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-511', name: 'Universal Human Values', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (EEE)',
      code: 'EEE',
      badge: 'Electrical & Electronics',
      color: '#d97706',
      subjects: [
        { code: 'BTEE-T-PC-501', name: 'Control System Engineering', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTEE-T-PC-502', name: 'Electrical Machine-II', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTEE-T-PC-503', name: 'Electrical Power Transmission and Distribution', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTEC-T-PE-502', name: 'Digital Signal Processing', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTEE-T-PE-501', name: 'Electrical Vehicle and Renewable Energy System', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-511', name: 'Universal Human Values', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (MECH)',
      code: 'MECH',
      badge: 'Mechanical Engineering',
      color: '#b91c1c',
      subjects: [
        { code: 'BTME-T-OE-501', name: 'Power Plant Engineering', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTME-T-PC-501', name: 'Machine Design', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTME-T-PC-502', name: 'IC Engine & Gas Turbine', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTME-T-PC-503', name: 'Machining Science and Technology', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTME-T-PC-505', name: 'CAD / CAM', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-511', name: 'Universal Human Values', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
      ],
    },
    {
      name: 'B. Tech (AGRIL)',
      code: 'AGRIL',
      badge: 'Agricultural Engg',
      color: '#0284c7',
      subjects: [
        { code: 'BTAG-T-OE-501', name: 'Sensors and Transducers', date: '05-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
        { code: 'BTAG-T-PC-501', name: 'Tractor Engines, Systems and Controls', date: '06-11-2026', day: 'Friday', time: '8:30 am to 9:30 am' },
        { code: 'BTAG-T-PC-502', name: 'Watershed Hydrology, Planning and Management', date: '07-11-2026', day: 'Saturday', time: '8:30 am to 9:30 am' },
        { code: 'BTAG-T-PC-503', name: 'Post harvest Engineering of Cereals, Pulses and Oil Seeds', date: '09-11-2026', day: 'Monday', time: '8:30 am to 9:30 am' },
        { code: 'BTAG-T-PE-501', name: 'Structural Design, Estimation and Costing', date: '10-11-2026', day: 'Tuesday', time: '8:30 am to 9:30 am' },
        { code: 'BTBS-T-MC-511', name: 'Universal Human Values', date: '11-11-2026', day: 'Wednesday', time: '8:30 am to 9:30 am' },
        { code: 'BTAG-T-PE-502', name: 'GIS and Remote Sensing', date: '12-11-2026', day: 'Thursday', time: '8:30 am to 9:30 am' },
      ],
    },
  ],
  instructions: [
    'All Lab End Examinations will be conducted from 05/11/2026 to 12/11/2026 as per the timetable provided by the respective HoDs.',
    'All HoDs are requested to display and circulate the Lab Examination schedule among all concerned students and faculty members to ensure smooth conduct of the examinations.',
  ],
  signatory: {
    name: 'Dr. Pallab Kumar Kar',
    designation: 'Controller of Examinations',
    institution: 'GIFT Autonomous, Bhubaneswar',
    phone: '7873059041',
    web: 'www.gift.edu.in',
    email: 'exam@gift.edu.in',
  },
};

export default function OfficialCollegeNoticeModal({
  notice = GIFT_MODULAR_TEST_2_NOTICE,
  userBranch = 'CSE',
  onClose,
}) {
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-select user's branch if available
  const activeBranchCode = useMemo(() => {
    if (selectedBranch !== 'ALL') return selectedBranch;
    return 'ALL';
  }, [selectedBranch]);

  // Filter branches and subjects
  const displayedBranches = useMemo(() => {
    let list = notice.branches || [];
    if (activeBranchCode !== 'ALL') {
      list = list.filter((b) => b.code.toUpperCase() === activeBranchCode.toUpperCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list
        .map((b) => ({
          ...b,
          subjects: b.subjects.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.code.toLowerCase().includes(q) ||
              s.date.includes(q) ||
              b.name.toLowerCase().includes(q)
          ),
        }))
        .filter((b) => b.subjects.length > 0);
    }
    return list;
  }, [notice, activeBranchCode, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `${notice.title}\nDates: ${notice.duration}\nPublished by: ${notice.signatory.designation}, ${notice.signatory.institution}\nWeb: ${notice.signatory.web}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="gift-notice-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gift-notice-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Top Control Bar */}
        <div className="gift-notice-topbar no-print">
          <div className="gift-topbar-left">
            <span className="gift-official-badge">
              <Sparkles size={13} />
              AUTONOMOUS EXAMINATION CELL CIRCULAR
            </span>
            <span className="gift-ref-pill">Ref: {notice.circularNo}</span>
          </div>

          <div className="gift-topbar-actions">
            <button
              type="button"
              className="gift-btn-secondary"
              onClick={handleShare}
              title="Copy official notice link"
            >
              <Share2 size={14} />
              <span>{copied ? 'Copied Link!' : 'Share'}</span>
            </button>
            <button
              type="button"
              className="gift-btn-primary"
              onClick={handlePrint}
              title="Print official timetable circular"
            >
              <Printer size={14} />
              <span>Print Official Notice</span>
            </button>
            <button
              type="button"
              className="gift-modal-close"
              onClick={onClose}
              aria-label="Close notice"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notice Sheet Body */}
        <div className="gift-notice-sheet">
          {/* Email / Formal Dispatch Header */}
          <div className="gift-email-meta-strip">
            <div className="gift-email-avatar">
              <Building2 size={24} />
            </div>
            <div className="gift-email-info">
              <div className="gift-email-subject">
                <h2>{notice.title}</h2>
                <span className="gift-inbox-tag">Inbox</span>
              </div>
              <div className="gift-email-sender-line">
                <strong>{notice.authority}</strong>
                <span className="gift-email-address">&lt;{notice.email}&gt;</span>
                <span className="gift-email-date">• {notice.date}</span>
              </div>
              <div className="gift-email-to-line">
                <span>to: </span>
                <code>{notice.recipients}</code>
              </div>
            </div>
          </div>

          {/* Institutional Watermark Letterhead */}
          <div className="gift-letterhead">
            <div className="gift-crest-box">
              <div className="gift-crest-emblem">GIFT</div>
              <div className="gift-institution-title">
                <h1>GANDHI INSTITUTE FOR TECHNOLOGY (GIFT)</h1>
                <p className="gift-subtitle">AUTONOMOUS INSTITUTION · AFFILIATED TO BPUT · ACCREDITED BY NAAC 'A++' GRADE</p>
                <p className="gift-coe-office">OFFICE OF THE CONTROLLER OF EXAMINATIONS</p>
              </div>
            </div>
            <div className="gift-letterhead-rule" />
          </div>

          {/* Circular Text */}
          <div className="gift-circular-body">
            <p className="gift-greeting">Dear Students,</p>
            <p className="gift-lead-text">
              The <strong>Modular Test -II</strong> for <strong>B.Tech 5th Semester</strong> will be conducted from{' '}
              <span className="gift-date-highlight">{notice.duration}</span> as per the schedule given below:
            </p>
            <p className="gift-advisory-note">
              All students are advised to take note of the schedule and prepare accordingly.
            </p>
          </div>

          {/* Schedule Banner */}
          <div className="gift-schedule-banner">
            <h3>{notice.heading}</h3>
            <span className="gift-slot-badge">Timing: {notice.timeSlot}</span>
          </div>

          {/* Branch Filter Tabs (Screen Only) */}
          <div className="gift-branch-nav no-print">
            <div className="gift-filter-header">
              <span className="gift-filter-label">
                <Filter size={13} />
                Filter by Programme / Branch:
              </span>
              <div className="gift-search-wrap">
                <input
                  type="text"
                  placeholder="Search subject code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="gift-search-input"
                />
              </div>
            </div>

            <div className="gift-branch-tabs">
              <button
                type="button"
                className={`gift-branch-btn ${selectedBranch === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedBranch('ALL')}
              >
                All Branches (Master Roster)
              </button>
              {notice.branches.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  className={`gift-branch-btn ${selectedBranch === b.code ? 'active' : ''} ${
                    userBranch?.toUpperCase() === b.code ? 'my-branch' : ''
                  }`}
                  onClick={() => setSelectedBranch(b.code)}
                >
                  <span>{b.name}</span>
                  {userBranch?.toUpperCase() === b.code && (
                    <span className="gift-my-tag">My Branch</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Authentic Multi-Branch Timetable Table */}
          <div className="gift-table-container">
            <table className="gift-exam-table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Program (Branch)</th>
                  <th style={{ width: '16%' }}>Subject Code</th>
                  <th style={{ width: '38%' }}>Subject Name</th>
                  <th style={{ width: '14%' }}>Date (Day)</th>
                  <th style={{ width: '14%' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {displayedBranches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="gift-empty-cell">
                      No matching subjects found for query "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  displayedBranches.map((branch) =>
                    branch.subjects.map((sub, sIdx) => {
                      const isFirst = sIdx === 0;
                      return (
                        <tr
                          key={`${branch.code}-${sub.code}-${sIdx}`}
                          className={`gift-row ${branch.code === userBranch?.toUpperCase() ? 'gift-row-focused' : ''}`}
                        >
                          {isFirst && (
                            <td
                              rowSpan={branch.subjects.length}
                              className="gift-branch-col"
                              style={{ borderLeftColor: branch.color }}
                            >
                              <div className="gift-branch-sticky">
                                <strong>{branch.name}</strong>
                                <span className="gift-branch-badge">{branch.badge}</span>
                              </div>
                            </td>
                          )}
                          <td className="gift-code-col">
                            <code>{sub.code}</code>
                          </td>
                          <td className="gift-name-col">
                            <strong>{sub.name}</strong>
                          </td>
                          <td className="gift-date-col">
                            <span className="gift-date-val">{sub.date}</span>
                            <span className="gift-day-val">{sub.day}</span>
                          </td>
                          <td className="gift-time-col">
                            <span className="gift-time-pill">{sub.time}</span>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Practical & Lab Exam Guidelines */}
          <div className="gift-lab-notice-box">
            <div className="gift-lab-heading">
              <CheckCircle2 size={16} />
              <strong>Departmental Lab Examination Schedule Directive</strong>
            </div>
            <ul className="gift-lab-list">
              {notice.instructions.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>

          {/* Official Signatory Ledger */}
          <div className="gift-signatory-strip">
            <div className="gift-signatory-copy-info">
              <small className="gift-copy-to">
                <strong>Copy to:</strong> Chairman / Secretary / Vice-Chairman / Principal / Vice-Principal / All HoDs / Dean Academics / Notice Boards / Website.
              </small>
            </div>

            <div className="gift-signature-block">
              <div className="gift-seal-stamp">
                <span className="gift-seal-inner">GIFT COE SEAL</span>
              </div>
              <div className="gift-sign-details">
                <span className="gift-thanks">Thanks &amp; Regards,</span>
                <strong className="gift-sign-name">{notice.signatory.name}</strong>
                <span className="gift-sign-desig">{notice.signatory.designation}</span>
                <span className="gift-sign-inst">{notice.signatory.institution}</span>
                <div className="gift-sign-contact">
                  <span>Mob: {notice.signatory.phone}</span>
                  <span>•</span>
                  <span>Web: <a href={`https://${notice.signatory.web}`} target="_blank" rel="noreferrer">{notice.signatory.web}</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
