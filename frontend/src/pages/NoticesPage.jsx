import { useState, useEffect } from 'react'
import { 
  Bell, 
  Search, 
  Pin, 
  Download, 
  Calendar, 
  ExternalLink, 
  Filter, 
  CheckCircle,
  FileText,
  Megaphone
} from 'lucide-react'
import { downloadNoticePdf } from '../utils/pdfGenerator'
import { notificationsApi } from '../services/notificationsApi.js'
import OfficialCollegeNoticeModal, { GIFT_MODULAR_TEST_2_NOTICE } from '../components/ExaminationCell/OfficialCollegeNoticeModal.jsx'
import './NoticesPage.css'

const allNotices = [
  {
    id: 'gift-mod2-2026',
    title: 'B.Tech 5th Semester Modular test-II schedule, 2026',
    tag: 'exam',
    date: '04 Nov 2026',
    publisher: 'Controller of Examinations (GIFT)',
    pinned: true,
    summary: 'The Modular Test -II for B.Tech 5th Semester will be conducted from 05 November 2026 to 12 November 2026 across all branches (CSE, CSE-AI, CS & IOT, CIVIL, EEE, ECE, MECH, AGRIL). Time: 8:30 am to 9:30 am.',
    content: 'Dear Students, The Modular Test -II for B.Tech 5th Semester will be conducted from 05 November 2026 to 12 November 2026 as per official schedule. All students are advised to prepare accordingly. Lab examinations will be conducted per respective HoD schedules.',
    attachment: 'BTech_5th_Sem_Modular_Test_II_Schedule_2026.pdf',
    isOfficialModularNotice: true,
  },
  {
    id: 1,
    title: 'Registration & Verification for PRERANA State Scholarship 2026-27',
    tag: 'scholarship',
    date: '27 Sep 2026',
    publisher: 'Dean of Student Welfare',
    pinned: true,
    summary: 'Eligible SC/ST/OBC students from Odisha must submit online renewal forms with valid income and caste certificates before 15 October 2026.',
    content: 'All eligible undergraduate and postgraduate scholars belonging to reserved categories are hereby advised to update their biometric Aadhaar linking and upload current semester marksheets on the official state portal.',
    attachment: 'Circular_PRERANA_2026.pdf'
  },
  {
    id: 2,
    title: 'BPUT Even Semester Result Declaration & Re-checking Guidelines',
    tag: 'exam',
    date: '25 Sep 2026',
    publisher: 'Controller of Examinations',
    pinned: true,
    summary: 'Results for B.Tech 6th Semester Regular/Back exams have been published on the university portal. Deadline for re-checking applications is 05 October.',
    content: 'Students desiring verification/photocopy of answer scripts must apply through college student cell with a processing fee of Rs. 200 per theory subject.',
    attachment: 'Rechecking_Notification_2026.pdf'
  },
  {
    id: 3,
    title: 'Cognizant & Tata Consultancy Services Campus Recruitment Drive',
    tag: 'placement',
    date: '22 Sep 2026',
    publisher: 'Training & Placement Cell',
    pinned: false,
    summary: 'Final year CSE, IT, and ECE students having 65% aggregate without active backlogs must complete the registration portal before Friday.',
    content: 'Online aptitude assessments will be conducted on campus server labs starting Monday. Professional dress code and college RFID ID card are strictly mandatory.',
    attachment: 'Placement_Eligibility_Matrix.pdf'
  },
  {
    id: 4,
    title: 'AICTE-Approved Weekend GATE Preparation and Mentorship Classes',
    tag: 'academic',
    date: '19 Sep 2026',
    publisher: 'Department of Computer Science',
    pinned: false,
    summary: 'Special weekend coaching for GATE 2027 by senior professors commences this Saturday at Seminar Hall 2.',
    content: 'Detailed schedule, syllabus modules, and practice mock tests will be hosted on the college LMS. Attendance in these sessions will be counted towards academic credits.',
    attachment: 'GATE_Module_Syllabus.pdf'
  },
  {
    id: 5,
    title: 'Annual Inter-College Sports & Cultural Fiesta - TARANG 2026',
    tag: 'event',
    date: '15 Sep 2026',
    publisher: 'Cultural & Sports Committee',
    pinned: false,
    summary: 'Auditions for music, dance, hackathons, and cricket tournament trials start from next week. Cash prizes worth Rs. 2,00,000.',
    content: 'Club leaders and branch coordinators may register their respective squads at the student affairs desk.',
    attachment: 'TARANG_Rulebook.pdf'
  }
]

export default function NoticesPage() {
  const [selectedTag, setSelectedTag] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedNotice, setSelectedNotice] = useState(null)
  const [showOfficialModal, setShowOfficialModal] = useState(false)
  const [facultyNotices, setFacultyNotices] = useState([])

  useEffect(() => {
    let isMounted = true;
    const loadFacultyNotices = async () => {
      try {
        const list = await notificationsApi.getStudentNotifications('01');
        if (!isMounted || !Array.isArray(list)) return;

        const mapped = list.map(n => ({
          id: `fac-${n.id}`,
          title: n.title,
          tag: 'faculty',
          category: n.category,
          date: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today',
          publisher: `${n.facultyName || 'Course Faculty'} (${n.subjectCode || 'CSE Dept'})`,
          pinned: n.priority === 'URGENT',
          summary: n.message.slice(0, 150) + (n.message.length > 150 ? '...' : ''),
          content: n.message,
          attachment: n.attachmentName || (n.category === 'EXAMINATION' ? 'Modular_Exam_Notice.pdf' : 'Academic_Notification.pdf')
        }));

        setFacultyNotices(mapped);
      } catch (e) {
        console.warn('Failed to load faculty notices on Notices page', e);
      }
    };

    loadFacultyNotices();
    window.addEventListener('apna_campus_notifications_updated', loadFacultyNotices);
    return () => {
      isMounted = false;
      window.removeEventListener('apna_campus_notifications_updated', loadFacultyNotices);
    };
  }, []);

  const combinedNotices = [...facultyNotices, ...allNotices];

  const filtered = combinedNotices.filter((n) => {
    const matchesTag = selectedTag === 'all' || n.tag === selectedTag
    const matchesQuery = query.trim() === '' || 
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.summary.toLowerCase().includes(query.toLowerCase()) ||
      (n.publisher && n.publisher.toLowerCase().includes(query.toLowerCase()))
    return matchesTag && matchesQuery
  })

  return (
    <div className="notices-page">
      <div className="notices-header">
        <div>
          <h1 className="notices-title">University Circulars & Notice Board</h1>
          <p className="notices-subtitle">Official announcements, examination notifications, and administrative circulars</p>
        </div>
      </div>

      <div className="notices-controls">
        <div className="notices-cats">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'faculty', label: 'Faculty Broadcasts' },
            { id: 'academic', label: 'Academic' },
            { id: 'exam', label: 'Examinations' },
            { id: 'scholarship', label: 'Scholarship' },
            { id: 'placement', label: 'Placement' },
            { id: 'event', label: 'Events' }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`notices-cat-btn ${selectedTag === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="notices-search-box">
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search circulars..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notices-list">
        {filtered.map((item) => (
          <div key={item.id} className={`notice-card ${item.pinned ? 'pinned' : ''}`}>
            <div className="notice-meta-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.pinned && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Pin size={13} /> Pinned Circular
                  </span>
                )}
                <span className={`notice-tag-badge ${item.tag}`}>
                  {item.tag}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                <Calendar size={13} />
                <span>{item.date}</span>
                <span>•</span>
                <span>{item.publisher}</span>
              </div>
            </div>

            <div className="notice-card-body">
              <h3 onClick={() => setSelectedNotice(item)}>{item.title}</h3>
              <p>{item.summary}</p>
            </div>

            <div className="notice-footer">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} color="#64748b" /> {item.attachment}
              </span>
              <div className="notice-actions">
                <button 
                  className="btn-notice-action" 
                  onClick={() => downloadNoticePdf(item)}
                >
                  <Download size={14} /> PDF
                </button>
                <button 
                  className="btn-notice-action"
                  onClick={() => setSelectedNotice(item)}
                >
                  Read Full Circular
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedNotice && (
        <div className="payment-modal-backdrop" onClick={() => setSelectedNotice(null)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <button className="payment-modal-close" onClick={() => setSelectedNotice(null)}>×</button>
            <span className={`notice-tag-badge ${selectedNotice.tag}`} style={{ marginBottom: '10px', display: 'inline-block' }}>
              {selectedNotice.tag}
            </span>
            <h2 style={{ fontSize: '1.3rem', margin: '4px 0 10px', color: '#0a0f1e' }}>{selectedNotice.title}</h2>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <span>Published: {selectedNotice.date}</span>
              <span>By: {selectedNotice.publisher}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '0.92rem', lineHeight: '1.6', color: '#334155', marginBottom: '20px' }}>
              {selectedNotice.content}
            </div>
            {(selectedNotice.isOfficialModularNotice || selectedNotice.title?.includes('Modular')) && (
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className="btn-pay-now"
                  style={{ width: '100%', justifyContent: 'center', background: '#1e3a8a', padding: '10px' }}
                  onClick={() => setShowOfficialModal(true)}
                >
                  🏛 View Full Official Multi-Branch Schedule Circular (PDF View)
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn-pay-now" 
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => downloadNoticePdf(selectedNotice)}
              >
                <Download size={14} /> Download Official Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {showOfficialModal && (
        <OfficialCollegeNoticeModal
          notice={GIFT_MODULAR_TEST_2_NOTICE}
          userBranch="CSE"
          onClose={() => setShowOfficialModal(false)}
        />
      )}
    </div>
  )
}
