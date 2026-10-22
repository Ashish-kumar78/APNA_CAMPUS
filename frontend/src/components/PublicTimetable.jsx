import React, { useState } from 'react';
import {
  Printer,
  Download,
  ArrowLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';
import { downloadTimetablePdf } from '../utils/pdfGenerator';
import './PublicTimetable.css';

// SVG Crest Emblem matching the college gear logo shown in the prompt images
function CollegeGearLogo({ size = 70 }) {
  return (
    <div className="college-gear-logo-wrap" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="college-gear-svg"
      >
        {/* Blue Half Gear (Left) */}
        <path
          d="M 50 10 
             A 40 40 0 0 0 50 90 
             L 50 78 
             A 28 28 0 0 1 50 22 
             Z"
          fill="#0072ce"
        />
        {/* Blue Gear Teeth */}
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-90 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-60 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-30 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-120 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-150 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#0072ce" transform="rotate(-180 50 50)" />

        {/* Red Half Gear (Right) */}
        <path
          d="M 50 10 
             A 40 40 0 0 1 50 90 
             L 50 78 
             A 28 28 0 0 0 50 22 
             Z"
          fill="#d02b2b"
        />
        {/* Red Gear Teeth */}
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(0 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(30 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(60 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(90 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(120 50 50)" />
        <rect x="47" y="2" width="6" height="10" fill="#d02b2b" transform="rotate(150 50 50)" />

        {/* Inner White Circle */}
        <circle cx="50" cy="50" r="26" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />

        {/* Inner Torch / Crest & College Letters */}
        <circle cx="50" cy="50" r="22" fill="#ffffff" />
        <path d="M 50 34 L 54 44 L 46 44 Z" fill="#f59e0b" />
        <path d="M 48 44 L 52 44 L 51 52 L 49 52 Z" fill="#991b1b" />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          fill="#005691"
          letterSpacing="0.5"
        >
          APNA
        </text>
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#d02b2b"
        >
          CAMPUS
        </text>
      </svg>
    </div>
  );
}

// Student Class Section List (Matching Image 2)
const STUDENT_CLASSES = [
  { id: 'anand-1', name: 'Bachelor of Technology / ANAND (1 ST SEM)' },
  { id: 'behera-1', name: 'Bachelor of Technology / BEHERA (1 ST SEM)' },
  { id: 'bhaba-1', name: 'Bachelor of Technology / BHABA (1 ST SEM)' },
  { id: 'kalam-1', name: 'Bachelor of Technology / KALAM (1 ST SEM)' },
  { id: 'raman-1', name: 'Bachelor of Technology / RAMAN (1 ST SEM)' },
  { id: 'sarabhai-1', name: 'Bachelor of Technology / SARABHAI (1 ST SEM)' },
  { id: 'visweswaray-1', name: 'Bachelor of Technology / VISWESWARAY (1 ST SEM)' },
  { id: 'bose-1', name: 'Bachelor of Technology / BOSE (1 ST SEM)' },
  { id: 'khosla-1', name: 'Bachelor of Technology / KHOSLA (1 ST SEM)' },
  { id: 'civil-3', name: 'Bachelor of Technology / CIVIL (3 RD SEM)' },
  { id: 'ece-3', name: 'Bachelor of Technology / ECE (3 RD SEM)' },
  { id: 'btech-2028-p-5th-cse-genius', name: 'BTECH 2028-P/5 TH SEM/CSE (AI) - Genius' },
  { id: 'btech-2028-p-5th-cse-turing', name: 'BTECH 2028-P/5 TH SEM/CSE - Turing' },
  { id: 'btech-mech-5', name: 'Bachelor of Technology / MECHANICAL (5 TH SEM)' },
  { id: 'mba-1', name: 'Master of Business Administration / MBA (1 ST SEM)' },
  { id: 'mca-1', name: 'Master of Computer Applications / MCA (1 ST SEM)' },
];

// Faculty Workload Table (Matching Image 1)
const FACULTY_TIMETABLE_DATA = [
  { sl: 1, name: 'Dr. Ananya Mishra', dept: 'AGRIL', theory: '9:0', lab: '1:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '10:0' },
  { sl: 2, name: 'Anuprita Chakra', dept: 'AGRIL', theory: '7:0', lab: '0:30', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '7:30' },
  { sl: 3, name: 'Gayatri Mohanty', dept: 'AGRIL', theory: '3:0', lab: '1:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '4:0' },
  { sl: 4, name: 'Laxmi Naik', dept: 'AGRIL', theory: '0:0', lab: '3:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '3:0' },
  { sl: 5, name: 'Dr. Md Khalid Khan', dept: 'AGRIL', theory: '4:0', lab: '1:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '5:0' },
  { sl: 6, name: 'Nilima Bala', dept: 'AGRIL', theory: '0:0', lab: '2:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '2:0' },
  { sl: 7, name: 'Rakesh Kumar Behera', dept: 'AGRIL', theory: '8:0', lab: '0:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '8:0' },
  { sl: 8, name: 'Shantanu Rath', dept: 'AGRIL', theory: '10:0', lab: '5:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '15:0' },
  { sl: 9, name: 'Dr. Siprali Panda', dept: 'AGRIL', theory: '3:0', lab: '1:30', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '4:30' },
  { sl: 10, name: 'Dr. Satya Ranjan Pattanaik', dept: 'CSE', theory: '12:0', lab: '4:0', honors: '0:0', minor: '0:0', valueAdded: '1:0', total: '17:0' },
  { sl: 11, name: 'Asish Kumar Prusty', dept: 'CSE', theory: '8:0', lab: '6:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '14:0' },
  { sl: 12, name: 'Supriya Sahoo', dept: 'CSE', theory: '9:0', lab: '3:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '12:0' },
  { sl: 13, name: 'Monalisa Samal', dept: 'CSE', theory: '7:0', lab: '2:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '9:0' },
  { sl: 14, name: 'Smruti Smaraki Sarangi', dept: 'CSE', theory: '8:0', lab: '0:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '8:0' },
  { sl: 15, name: 'Dr. P. Mohapatra', dept: 'CSE', theory: '9:0', lab: '3:0', honors: '0:0', minor: '0:0', valueAdded: '2:0', total: '14:0' },
  { sl: 16, name: 'Bismita Manjari Biswal', dept: 'BSH', theory: '6:0', lab: '0:0', honors: '0:0', minor: '0:0', valueAdded: '0:0', total: '6:0' },
];

// Room Academic Loads Table (Matching Image 3)
const ROOM_LOADS_DATA = [
  { sl: 1, roomNo: 'CANTEEN', hours: '15:0', use: 'Lunch & Student Refreshments' },
  { sl: 2, roomNo: '102', hours: '34:0', use: 'COMPUTER LAB - 1' },
  { sl: 3, roomNo: '104', hours: '28:0', use: 'COMPUTER LAB - 2' },
  { sl: 4, roomNo: '108', hours: '0:0', use: 'Classroom' },
  { sl: 5, roomNo: '109', hours: '39:0', use: 'Classroom' },
  { sl: 6, roomNo: '110', hours: '34:0', use: 'ELECTRICAL MACHINE LAB' },
  { sl: 7, roomNo: '111', hours: '20:0', use: 'MACHINICS OF SOLID LAB' },
  { sl: 8, roomNo: '111(A)', hours: '21:0', use: 'CENTRAL WORK SHOP' },
  { sl: 9, roomNo: '111(B)', hours: '5:0', use: 'CENTRAL WORK SHOP' },
  { sl: 10, roomNo: '113', hours: '2:0', use: 'IC ENGINE LAB' },
  { sl: 11, roomNo: '201', hours: '32:0', use: 'Smart Classroom' },
  { sl: 12, roomNo: '204', hours: '30:0', use: 'Classroom' },
  { sl: 13, roomNo: '205', hours: '28:0', use: 'Classroom' },
  { sl: 14, roomNo: '229', hours: '38:0', use: 'Core Smart Classroom (CSE AI & Genius)' },
  { sl: 15, roomNo: '412', hours: '24:0', use: 'SOFTWARE ENGINEERING LAB' },
  { sl: 16, roomNo: '423', hours: '36:0', use: 'ADVANCED AI & OS LAB' },
  { sl: 17, roomNo: 'Seminar Hall-2', hours: '18:0', use: 'EXECUTIVE SEMINAR HALL' },
  { sl: 18, roomNo: 'Auditorium', hours: '12:0', use: 'CAMPUS AUDITORIUM' },
];

// Floor Managers Table (Tab 4)
const FLOOR_MANAGERS_DATA = [
  { sl: 1, floor: 'Ground Floor (North & South Wings)', incharge: 'Mr. Biswajit Sahoo', contact: '+91 98610 88201', rooms: '101 to 113, Central Workshop', status: 'Active Supervision' },
  { sl: 2, floor: 'First Floor (Academic Block A)', incharge: 'Mr. Pradeep Barik', contact: '+91 98610 88202', rooms: '201 to 215, Faculty Chambers', status: 'Active Supervision' },
  { sl: 3, floor: 'Second Floor (Smart Classrooms Wing)', incharge: 'Mr. S. K. Nayak', contact: '+91 98610 88203', rooms: '220 to 235, IoT Center', status: 'Active Supervision' },
  { sl: 4, floor: 'Third Floor (Advanced Computing Labs)', incharge: 'Mrs. Sasmita Jena', contact: '+91 98610 88204', rooms: '301 to 325, AI Research Hub', status: 'Active Supervision' },
  { sl: 5, floor: 'Fourth Floor (Software Labs Wing)', incharge: 'Mr. J. Mohapatra', contact: '+91 98610 88205', rooms: '401 to 430, Project Studios', status: 'Active Supervision' },
];

// Online Class Timetable Table (Tab 5)
const ONLINE_TIMETABLE_DATA = [
  { sl: 1, subject: 'Artificial Intelligence & Neural Nets (CS501)', batch: 'B.Tech CSE - 5th Sem', faculty: 'Dr. Satya Ranjan Pattanaik', time: 'Saturday · 06:30 PM - 07:30 PM', platform: 'Apna LMS / Google Meet', link: 'https://meet.google.com/apna-cs501' },
  { sl: 2, subject: 'Operating Systems Virtual Kernel Debugging (CS502)', batch: 'B.Tech CSE - 5th Sem', faculty: 'Asish Kumar Prusty', time: 'Sunday · 10:00 AM - 11:30 AM', platform: 'Zoom Webinar', link: 'https://zoom.us/j/apna-os-lab' },
  { sl: 3, subject: 'GATE Aptitude & Problem Solving Drill', batch: 'All B.Tech 3rd & 4th Year', faculty: 'Shantanu Rath', time: 'Sunday · 04:00 PM - 06:00 PM', platform: 'Campus Live Stream', link: 'https://lms.apnacampus.edu.in/gate' },
  { sl: 4, subject: 'Software Engineering Agile Sprint Review (CS504)', batch: 'B.Tech CSE (AI) - Genius', faculty: 'Supriya Sahoo', time: 'Wednesday · 05:30 PM - 06:30 PM', platform: 'Google Meet', link: 'https://meet.google.com/apna-se' },
];

// Routine Grid Time Slots (Exact 30-min intervals from Image 4)
const ROUTINE_SLOTS = [
  '08:30 AM - 09:00 AM',
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
];

export default function PublicTimetable({ onClose }) {
  // Navigation Tabs matching top bar in images
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'faculty' | 'rooms' | 'floormanagers' | 'online'
  
  // Currently displayed detailed routine
  const [selectedRoutineTitle, setSelectedRoutineTitle] = useState('BTECH 2028-P/5 TH SEM/CSE (AI) - Genius\'s Timetable');
  const [showRoutineGrid, setShowRoutineGrid] = useState(true);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Handle viewing a routine from any tab
  const handleOpenRoutine = (title) => {
    setSelectedRoutineTitle(title.endsWith('Timetable') ? title : `${title}'s Timetable`);
    setShowRoutineGrid(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="apna-public-timetable-wrapper">
      {/* ── Top Gray Navigation Bar (Exact match to all 3 prompt images) ── */}
      <nav className="apna-tt-top-nav" aria-label="Timetable Navigation Bar">
        <div className="apna-tt-nav-links">
          <button
            type="button"
            className={`apna-tt-nav-tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('students');
              setShowRoutineGrid(false);
            }}
          >
            Timetable for Students
          </button>

          <button
            type="button"
            className={`apna-tt-nav-tab ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('faculty');
              setShowRoutineGrid(false);
            }}
          >
            Faculty Wise Timetable
          </button>

          <button
            type="button"
            className={`apna-tt-nav-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('rooms');
              setShowRoutineGrid(false);
            }}
          >
            Room Wise Timetable
          </button>

          <button
            type="button"
            className={`apna-tt-nav-tab ${activeTab === 'floormanagers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('floormanagers');
              setShowRoutineGrid(false);
            }}
          >
            Timetable for Floormanagers
          </button>

          <button
            type="button"
            className={`apna-tt-nav-tab ${activeTab === 'online' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('online');
              setShowRoutineGrid(false);
            }}
          >
            Online Class Timetable
          </button>
        </div>

        {/* Action Controls: Return to Login / Print / PDF */}
        <div className="apna-tt-top-actions">
          {showRoutineGrid && (
            <button
              type="button"
              className="apna-tt-action-btn"
              onClick={() => setShowRoutineGrid(false)}
              title="Back to List"
            >
              <ArrowLeft size={13} /> Back to List
            </button>
          )}

          <button
            type="button"
            className="apna-tt-action-btn"
            onClick={() => window.print()}
            title="Print this Timetable"
          >
            <Printer size={13} /> Print
          </button>

          <button
            type="button"
            className="apna-tt-action-btn"
            onClick={() => downloadTimetablePdf()}
            title="Download PDF"
          >
            <Download size={13} /> Download PDF
          </button>

          {onClose && (
            <button
              type="button"
              className="apna-tt-action-btn close-btn"
              onClick={onClose}
              title="Return to Apna Campus Portal Login"
            >
              <X size={14} /> Close
            </button>
          )}
        </div>
      </nav>

      {/* ── Main Timetable Box (White framed card matching images) ── */}
      <main className="apna-tt-card-container">
        {/* Centered Crest Header */}
        <header className="apna-tt-header-box">
          <div className="apna-tt-logo-center">
            <CollegeGearLogo size={74} />
          </div>

          <h1 className="apna-tt-college-title">
            Apna Campus Autonomous, Bhubaneswar
          </h1>

          {/* Subtitle: Either the exact Routine Title or Category Heading */}
          {showRoutineGrid ? (
            <h2 className="apna-tt-routine-title">
              {selectedRoutineTitle}
            </h2>
          ) : activeTab === 'students' ? (
            <h2 className="apna-tt-category-title">
              CLASS TIMETABLES
            </h2>
          ) : activeTab === 'faculty' ? (
            <h2 className="apna-tt-category-title">
              TEACHER'S TIMETABLES
            </h2>
          ) : activeTab === 'rooms' ? (
            <h2 className="apna-tt-category-title">
              ROOM/LAB ACADEMIC LOADS
            </h2>
          ) : activeTab === 'floormanagers' ? (
            <h2 className="apna-tt-category-title">
              FLOOR-WISE MONITORING TIMETABLES
            </h2>
          ) : (
            <h2 className="apna-tt-category-title">
              ONLINE CLASS TIMETABLE
            </h2>
          )}
        </header>

        {/* ══════════════════════════════════════════════════════════════
            VIEW A: ROUTINE GRID (Exact pixel-accurate match to Image 4)
            ══════════════════════════════════════════════════════════════ */}
        {showRoutineGrid ? (
          <div className="apna-tt-grid-frame">
            <div className="apna-tt-routine-toolbar">
              <span className="routine-badge">
                <CheckCircle2 size={13} color="#16a34a" /> Official Certified Routine · Autumn Semester 2026-27
              </span>

              <div className="routine-quick-switch">
                <label htmlFor="quick-switch-select">Select Section / Faculty Routine:</label>
                <select
                  id="quick-switch-select"
                  value={selectedRoutineTitle.replace('\'s Timetable', '')}
                  onChange={(e) => handleOpenRoutine(e.target.value)}
                >
                  <option value="BTECH 2028-P/5 TH SEM/CSE (AI) - Genius">BTECH 2028-P/5 TH SEM/CSE (AI) - Genius</option>
                  <option value="Bachelor of Technology / ANAND (1 ST SEM)">B.Tech / ANAND (1 ST SEM)</option>
                  <option value="Bachelor of Technology / BEHERA (1 ST SEM)">B.Tech / BEHERA (1 ST SEM)</option>
                  <option value="Bachelor of Technology / BHABA (1 ST SEM)">B.Tech / BHABA (1 ST SEM)</option>
                  <option value="Bachelor of Technology / KALAM (1 ST SEM)">B.Tech / KALAM (1 ST SEM)</option>
                  <option value="Bachelor of Technology / CSE - Turing">B.Tech / CSE - Turing (5 TH SEM)</option>
                  <option value="Dr. Satya Ranjan Pattanaik">Teacher: Dr. Satya Ranjan Pattanaik (CSE)</option>
                  <option value="Asish Kumar Prusty">Teacher: Asish Kumar Prusty (CSE)</option>
                  <option value="Room No.-229">Room No.-229 (Smart Lecture Hall)</option>
                  <option value="Room No.-423">Room No.-423 (AI & OS Lab)</option>
                </select>
              </div>
            </div>

            <div className="apna-tt-table-responsive">
              <table className="apna-routine-table">
                <thead>
                  <tr>
                    <th className="th-time">Time</th>
                    <th className="th-day">Monday</th>
                    <th className="th-day">Tuesday</th>
                    <th className="th-day">Wednesday</th>
                    <th className="th-day">Thursday</th>
                    <th className="th-day">Friday</th>
                    <th className="th-day">Saturday</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: 08:30 AM - 09:00 AM */}
                  <tr>
                    <td className="td-time">08:30 AM - 09:00 AM</td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">SE(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Supriya Sahoo</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FLAT(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Smruti Smaraki Sarangi</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">OS(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Asish Kumar Prusty</div>
                    </td>
                  </tr>

                  {/* Row 2: 09:00 AM - 09:30 AM */}
                  <tr>
                    <td className="td-time">09:00 AM - 09:30 AM</td>
                    <td className="td-class td-lab" rowSpan={3}>
                      <div className="class-subj lab-subj">OS Lab(ALL)</div>
                      <div className="class-room">Room No.-423</div>
                      <div className="class-faculty">Asish Kumar Prusty,Samita Behera</div>
                    </td>
                    <td className="td-class td-lab" rowSpan={3}>
                      <div className="class-subj lab-subj">FAI Lab(ALL)</div>
                      <div className="class-room">Room No.-423</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik,Samita Behera</div>
                    </td>
                    <td className="td-class td-lab" rowSpan={3}>
                      <div className="class-subj lab-subj">SE Lab(ALL)</div>
                      <div className="class-room">Room No.-412</div>
                      <div className="class-faculty">Supriya Sahoo,Suman Dash</div>
                    </td>
                  </tr>

                  {/* Row 3: 09:30 AM - 10:00 AM */}
                  <tr>
                    <td className="td-time">09:30 AM - 10:00 AM</td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FAI(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">SE(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Supriya Sahoo</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FAI(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik</div>
                    </td>
                  </tr>

                  {/* Row 4: 10:00 AM - 10:30 AM */}
                  <tr>
                    <td className="td-time">10:00 AM - 10:30 AM</td>
                  </tr>

                  {/* Row 5: 10:30 AM - 11:00 AM */}
                  <tr>
                    <td className="td-time">10:30 AM - 11:00 AM</td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">DIP(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Monalisa Samal</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">SE(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Supriya Sahoo</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">OS(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Asish Kumar Prusty</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FLAT(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Smruti Smaraki Sarangi</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FAI(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">EIKT-II(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Bismita Manjari Biswal</div>
                    </td>
                  </tr>

                  {/* Row 6: 11:00 AM - 11:30 AM */}
                  <tr>
                    <td className="td-time">11:00 AM - 11:30 AM</td>
                  </tr>

                  {/* Row 7: 11:30 AM - 12:00 PM */}
                  <tr>
                    <td className="td-time">11:30 AM - 12:00 PM</td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FAI(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">AET-F (CRT)(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Shantanu Rath</div>
                    </td>
                    <td className="td-class td-special td-lunch" rowSpan={2}>
                      <em>LUNCH</em>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">EIKT-II(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Bismita Manjari Biswal</div>
                    </td>
                    <td className="td-empty"></td>
                    <td className="td-special td-lunch" rowSpan={2}>
                      <em>LUNCH</em>
                    </td>
                  </tr>

                  {/* Row 8: 12:00 PM - 12:30 PM */}
                  <tr>
                    <td className="td-time">12:00 PM - 12:30 PM</td>
                    <td className="td-empty"></td>
                  </tr>

                  {/* Row 9: 12:30 PM - 01:00 PM */}
                  <tr>
                    <td className="td-time">12:30 PM - 01:00 PM</td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">Toast Master(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Bikram Keshari Rout</div>
                    </td>
                    <td className="td-special td-lunch">
                      <em>LUNCH</em>
                    </td>
                    <td className="td-special td-lunch">
                      <em>LUNCH</em>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">NPTEL(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Nitu Singh</div>
                    </td>
                  </tr>

                  {/* Row 10: 01:00 PM - 01:30 PM */}
                  <tr>
                    <td className="td-time">01:00 PM - 01:30 PM</td>
                    <td className="td-special td-lunch">
                      <em>LUNCH</em>
                    </td>
                    <td className="td-special td-lunch">
                      <em>LUNCH</em>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">Toast Master(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Bikram Keshari Rout</div>
                    </td>
                    <td className="td-class">
                      <div className="class-subj">AET D(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Shalini Hota</div>
                    </td>
                  </tr>

                  {/* Row 11: 01:30 PM - 02:00 PM */}
                  <tr>
                    <td className="td-time">01:30 PM - 02:00 PM</td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FLAT(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Smruti Smaraki Sarangi</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">OS(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Asish Kumar Prusty</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">DIP(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Monalisa Samal</div>
                    </td>
                    <td className="td-special td-library" rowSpan={2}>
                      <strong>LIBRARY</strong>
                    </td>
                    <td className="td-special td-library" rowSpan={2}>
                      <strong>LIBRARY</strong>
                    </td>
                  </tr>

                  {/* Row 12: 02:00 PM - 02:30 PM */}
                  <tr>
                    <td className="td-time">02:00 PM - 02:30 PM</td>
                    <td className="td-special td-hobby" rowSpan={4}>
                      <strong>HOBBY CLUB</strong>
                    </td>
                  </tr>

                  {/* Row 13: 02:30 PM - 03:00 PM */}
                  <tr>
                    <td className="td-time">02:30 PM - 03:00 PM</td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-empty"></td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">DIP(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Monalisa Samal</div>
                    </td>
                  </tr>

                  {/* Row 14: 03:00 PM - 03:30 PM */}
                  <tr>
                    <td className="td-time">03:00 PM - 03:30 PM</td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">OS(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Asish Kumar Prusty</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">SEMINAR-II(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Dr. Satya Ranjan Pattanaik</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">SE(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Supriya Sahoo</div>
                    </td>
                    <td className="td-class" rowSpan={2}>
                      <div className="class-subj">FLAT(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Smruti Smaraki Sarangi</div>
                    </td>
                  </tr>

                  {/* Row 15: 03:30 PM - 04:00 PM */}
                  <tr>
                    <td className="td-time">03:30 PM - 04:00 PM</td>
                    <td className="td-class">
                      <div className="class-subj">AET D(ALL)</div>
                      <div className="class-room">Room No.-229</div>
                      <div className="class-faculty">Shalini Hota</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="apna-routine-footer-links">
              <button
                type="button"
                className="btn-back-to-sections"
                onClick={() => setShowRoutineGrid(false)}
              >
                ← Back to Class List
              </button>
              <span className="routine-footnote">
                Note: 75% minimum physical attendance is mandatory across all listed sessions as per Apna Campus Autonomous Regulations.
              </span>
            </div>
          </div>
        ) : null}

        {/* ══════════════════════════════════════════════════════════════
            VIEW B: TIMETABLE FOR STUDENTS (Exact match to Image 2)
            ══════════════════════════════════════════════════════════════ */}
        {!showRoutineGrid && activeTab === 'students' && (
          <div className="apna-tt-list-frame">
            <table className="apna-list-table">
              <tbody>
                {STUDENT_CLASSES.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="col-sl">{idx + 1}.</td>
                    <td className="col-name">
                      <button
                        type="button"
                        className="btn-class-link"
                        onClick={() => handleOpenRoutine(item.name)}
                      >
                        {item.name}
                      </button>
                    </td>
                    <td className="col-spacer"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW C: FACULTY WISE TIMETABLE (Exact match to Image 1)
            ══════════════════════════════════════════════════════════════ */}
        {!showRoutineGrid && activeTab === 'faculty' && (
          <div className="apna-tt-list-frame">
            <table className="apna-data-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>SL</th>
                  <th>FACULTY NAME</th>
                  <th>DEPARTMENT</th>
                  <th>THEORY</th>
                  <th>LAB</th>
                  <th>HONORS</th>
                  <th>MINOR</th>
                  <th>VALUE ADDED</th>
                  <th>TOTAL</th>
                  <th>SCHEDULED TIMETABLE LINK</th>
                </tr>
              </thead>
              <tbody>
                {FACULTY_TIMETABLE_DATA.map((fac) => (
                  <tr key={fac.sl}>
                    <td className="text-center bold">{fac.sl}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-item-link"
                        onClick={() => handleOpenRoutine(`${fac.name} (${fac.dept})`)}
                      >
                        {fac.name}
                      </button>
                    </td>
                    <td className="text-center">{fac.dept}</td>
                    <td className="text-center">{fac.theory}</td>
                    <td className="text-center">{fac.lab}</td>
                    <td className="text-center">{fac.honors}</td>
                    <td className="text-center">{fac.minor}</td>
                    <td className="text-center">{fac.valueAdded}</td>
                    <td className="text-center bold">{fac.total}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-item-link"
                        onClick={() => handleOpenRoutine(`${fac.name} (${fac.dept})`)}
                      >
                        View Routine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW D: ROOM WISE TIMETABLE (Exact match to Image 3)
            ══════════════════════════════════════════════════════════════ */}
        {!showRoutineGrid && activeTab === 'rooms' && (
          <div className="apna-tt-list-frame">
            <table className="apna-data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>SL</th>
                  <th>ROOM NO.</th>
                  <th>NO. OF HOURS ENGAGED IN A WEEK</th>
                  <th>NORMAL USE OF THE ROOM</th>
                </tr>
              </thead>
              <tbody>
                {ROOM_LOADS_DATA.map((rm) => (
                  <tr key={rm.sl}>
                    <td className="text-center bold">{rm.sl}.</td>
                    <td>
                      <button
                        type="button"
                        className="btn-item-link"
                        onClick={() => handleOpenRoutine(`Room ${rm.roomNo} - ${rm.use}`)}
                      >
                        {rm.roomNo}
                      </button>
                    </td>
                    <td className="text-center bold">{rm.hours}</td>
                    <td>{rm.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW E: TIMETABLE FOR FLOORMANAGERS
            ══════════════════════════════════════════════════════════════ */}
        {!showRoutineGrid && activeTab === 'floormanagers' && (
          <div className="apna-tt-list-frame">
            <table className="apna-data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>SL</th>
                  <th>FLOOR / WING</th>
                  <th>FLOOR IN-CHARGE</th>
                  <th>CONTACT</th>
                  <th>ASSIGNED ROOMS & LABS</th>
                  <th>INSPECTION STATUS</th>
                </tr>
              </thead>
              <tbody>
                {FLOOR_MANAGERS_DATA.map((fm) => (
                  <tr key={fm.sl}>
                    <td className="text-center bold">{fm.sl}.</td>
                    <td>
                      <button
                        type="button"
                        className="btn-item-link"
                        onClick={() => handleOpenRoutine(fm.floor)}
                      >
                        {fm.floor}
                      </button>
                    </td>
                    <td className="bold">{fm.incharge}</td>
                    <td className="text-center">{fm.contact}</td>
                    <td>{fm.rooms}</td>
                    <td className="text-center text-success bold">{fm.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            VIEW F: ONLINE CLASS TIMETABLE
            ══════════════════════════════════════════════════════════════ */}
        {!showRoutineGrid && activeTab === 'online' && (
          <div className="apna-tt-list-frame">
            <table className="apna-data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>SL</th>
                  <th>COURSE / SUBJECT TITLE</th>
                  <th>BATCH / CLASS</th>
                  <th>FACULTY</th>
                  <th>DAY & TIME SLOT</th>
                  <th>VIRTUAL PLATFORM & JOIN LINK</th>
                </tr>
              </thead>
              <tbody>
                {ONLINE_TIMETABLE_DATA.map((on) => (
                  <tr key={on.sl}>
                    <td className="text-center bold">{on.sl}.</td>
                    <td className="bold">{on.subject}</td>
                    <td>{on.batch}</td>
                    <td>{on.faculty}</td>
                    <td className="text-center bold">{on.time}</td>
                    <td className="text-center">
                      <a
                        href={on.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-item-link"
                      >
                        Join on {on.platform}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Page Footer */}
      <footer className="apna-tt-bottom-footer">
        <p>© 2026 Apna Campus Autonomous College, Bhubaneswar. All Academic Routines & Room Allocations Certified.</p>
      </footer>
    </div>
  );
}
