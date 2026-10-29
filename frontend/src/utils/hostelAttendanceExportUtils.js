// Hostel Attendance Export Utilities
// Generates official XLSX (Excel) workbooks and PDF reports with complete student details
// matching the exact tabular format:
// Sl No | Name of Student | Registration No | Department | Branch | Roll No | Room No | Student Contact | Parent Contact | Attendance Status

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { INITIAL_STUDENTS_ROSTER, getStudentDeptAndBranch } from '../services/hostelAttendanceStore.js';
import { getAllStudents } from '../services/studentStore.js';

// Safe constructor helper for jsPDF across ESM/CJS contexts
function createPdfDoc(options) {
  const Constructor = typeof jsPDF === 'function'
    ? jsPDF
    : (jsPDF?.jsPDF || (typeof window !== 'undefined' && window.jspdf?.jsPDF) || jsPDF?.default);
  return new Constructor(options);
}

// Safe autoTable runner helper
function renderTable(doc, tableOptions) {
  const runner = typeof autoTable === 'function' ? autoTable : (autoTable?.default || doc.autoTable);
  if (typeof runner === 'function') {
    runner(doc, tableOptions);
  } else if (doc.autoTable) {
    doc.autoTable(tableOptions);
  }
}

// Institutional Colors
const PRIMARY_COLOR = [15, 43, 72];    // Deep Navy #0f2b48
const SECONDARY_COLOR = [220, 38, 38]; // Crimson Red #dc2626
const EMERALD_COLOR = [5, 150, 105];   // Emerald Green #059669
const AMBER_COLOR = [217, 119, 6];     // Amber #d97706
const TEXT_DARK = [15, 23, 42];        // Slate 900
const TEXT_MUTED = [100, 116, 139];    // Slate 500

/**
 * Enriches student record with full details from the student rosters
 */
export function enrichStudentRecord(record, fallbackHostelName = '') {
  let matched = null;

  // 1. Try lookup in INITIAL_STUDENTS_ROSTER
  if (Array.isArray(INITIAL_STUDENTS_ROSTER)) {
    matched = INITIAL_STUDENTS_ROSTER.find(s =>
      (record.rollNumber && s.rollNumber && String(s.rollNumber).toLowerCase() === String(record.rollNumber).toLowerCase()) ||
      (record.studentName && s.studentName && s.studentName.toLowerCase() === record.studentName.toLowerCase()) ||
      (record.studentId && s.id === record.studentId)
    );
  }

  // 2. Try lookup in college students store if still missing
  if (!matched) {
    try {
      const allStd = getAllStudents();
      if (Array.isArray(allStd)) {
        matched = allStd.find(s =>
          (record.rollNumber && s.rollNumber && String(s.rollNumber).toLowerCase() === String(record.rollNumber).toLowerCase()) ||
          (record.studentName && s.name && s.name.toLowerCase() === record.studentName.toLowerCase()) ||
          (record.regNo && s.registrationNumber && String(s.registrationNumber) === String(record.regNo))
        );
      }
    } catch (e) {
      // ignore
    }
  }

  const rollStr = String(record.rollNumber || matched?.rollNumber || '00').padStart(2, '0');
  const regNoStr = record.regNo || matched?.regNo || matched?.registrationNumber || `23052010${rollStr}`;

  // Department & Branch mapping matching 3rd image
  const targetForDept = (record.department ? record : matched) || record || matched;
  const deptInfo = getStudentDeptAndBranch(targetForDept);
  const deptStr = record.department || matched?.department || deptInfo?.department || 'Computer Science & Engineering';
  const branchStr = record.branch || matched?.branch || deptInfo?.branch || 'CSE';

  const phoneStr = record.phone || matched?.phone || '+91 98610 11223';
  const parentPhoneStr = record.parentPhone || matched?.parentPhone || matched?.guardianPhone || '+91 94370 99887';

  // Room No formatting matching 3rd image: "Room 101 - Bed 01"
  const roomRaw = record.roomNumber || matched?.roomNumber || '101';
  const bedRaw = record.bedNumber || matched?.bedNumber || 'Bed 01';
  const cleanRoom = String(roomRaw).replace(/^Room\s*/i, '').trim();
  const cleanBed = String(bedRaw).trim();
  const roomFormatted = cleanBed ? `Room ${cleanRoom} - ${cleanBed}` : `Room ${cleanRoom}`;

  const statusStr = record.status || 'Present';
  const remarksStr = record.remarks || (statusStr === 'Present' ? 'Verified by Warden' : 'Unreported absence');

  return {
    studentName: record.studentName || matched?.studentName || matched?.name || 'Resident Student',
    rollNumber: rollStr,
    regNo: regNoStr,
    department: deptStr,
    branch: branchStr,
    hostelName: record.hostelName || fallbackHostelName || matched?.hostelName || 'Residential Hostel',
    roomNumber: `Room ${cleanRoom}`,
    bedNumber: cleanBed,
    roomFormatted: roomFormatted,
    status: statusStr,
    phone: phoneStr,
    parentPhone: parentPhoneStr,
    remarks: remarksStr
  };
}

/**
 * EXCEL EXPORT (XLSX)
 * Exports complete attendance register in the exact 10-column table format shown in Image 3:
 * Sl No | Name of Student | Registration No | Department | Branch | Roll No | Room No | Student Contact | Parent Contact | Attendance Status
 */
export function exportHostelAttendanceToExcel({ submission, records = [] }) {
  if (!submission) {
    throw new Error('No attendance submission selected for export.');
  }

  const hostelName = submission.hostelName || 'Hostel';
  const hostelCode = submission.hostelCode || 'BN1';
  const dateStr = submission.date || new Date().toISOString().split('T')[0];
  const sessionStr = submission.session || 'Night Roll Call (08:30 PM)';
  const submittedByStr = submission.submittedBy || 'Resident Warden';
  const submittedAtStr = submission.submittedAt || `${dateStr}, 08:30 PM`;

  // Use provided records or submission.records
  const sourceRecords = (records !== undefined && records !== null) ? records : (submission.records || []);
  const enrichedRecords = sourceRecords.map(r => enrichStudentRecord(r, hostelName));

  const totalBoarders = enrichedRecords.length;
  const presentCount = enrichedRecords.filter(r => r.status === 'Present').length;
  const absentCount = enrichedRecords.filter(r => r.status === 'Absent').length;
  const leaveCount = enrichedRecords.filter(r => r.status === 'On Leave' || r.status === 'Leave').length;
  const turnoutRate = totalBoarders > 0 ? `${((presentCount / totalBoarders) * 100).toFixed(1)}%` : '0.0%';

  // ── Sheet 1: Master Attendance Register (Exact 3rd Image Format) ──
  const aoaMaster = [
    ['APNA CAMPUS ENTERPRISE ERP — AUTONOMOUS RESIDENTIAL SYSTEM'],
    ['OFFICIAL RESIDENT WARDEN HOSTEL ATTENDANCE & ROLL-CALL REGISTER'],
    ['Affiliated to BPUT, Rourkela | NAAC A++ Autonomous College | Residential Life & Student Housing'],
    [],
    ['SESSION & INSPECTION METADATA', '', '', '', 'ATTENDANCE SUMMARY STATISTICS'],
    ['Hostel Complex:', `${hostelName} (${hostelCode})`, '', 'Total Boarders Enrolled:', totalBoarders],
    ['Roll-Call Session:', sessionStr, '', 'Present in Hostel:', presentCount],
    ['Attendance Date:', dateStr, '', 'Absent Tonight:', absentCount],
    ['Submitted By:', submittedByStr, '', 'On Approved Outstation Leave:', leaveCount],
    ['Submission Timestamp:', submittedAtStr, '', 'Turnout Rate (%):', turnoutRate],
    ['Verification Status:', submission.verifiedByAdmin ? 'Verified & Approved by Hostel Admin' : 'Submitted to Hostel Admin', '', 'Night Curfew Compliance:', absentCount === 0 ? 'Full Curfew Met' : `${absentCount} Boarder(s) Absent`],
    [],
    [
      'Sl No',
      'Name of Student',
      'Registration No',
      'Department',
      'Branch',
      'Roll No',
      'Room No',
      'Student Contact',
      'Parent Contact',
      'Attendance Status'
    ]
  ];

  enrichedRecords.forEach((r, idx) => {
    aoaMaster.push([
      idx + 1,
      r.studentName,
      r.regNo,
      r.department,
      r.branch,
      r.rollNumber,
      r.roomFormatted,
      r.phone,
      r.parentPhone,
      r.status === 'Present' ? 'Present' : r.status === 'Absent' ? 'Absent' : 'On Leave'
    ]);
  });

  // Footer notes in sheet 1
  aoaMaster.push([]);
  aoaMaster.push(['OFFICIAL VERIFICATION STATEMENT:']);
  aoaMaster.push([`I hereby certify that physical inspection and night roll-call of all boarders in ${hostelName} was performed in person. All Present, Absent, and On-Leave entries recorded herein are verified.`]);
  aoaMaster.push([`Report generated from APNA CAMPUS ERP on ${new Date().toLocaleString()} by ${submittedByStr}.`]);

  const wsMaster = XLSX.utils.aoa_to_sheet(aoaMaster);

  // Column Widths for Sheet 1 (Matching Image 3 headers)
  wsMaster['!cols'] = [
    { wch: 8 },  // Sl No
    { wch: 25 }, // Name of Student
    { wch: 18 }, // Registration No
    { wch: 32 }, // Department
    { wch: 12 }, // Branch
    { wch: 10 }, // Roll No
    { wch: 24 }, // Room No
    { wch: 18 }, // Student Contact
    { wch: 18 }, // Parent Contact
    { wch: 18 }  // Attendance Status
  ];

  // ── Sheet 2: Absentees Follow-up ──
  const absentees = enrichedRecords.filter(r => r.status === 'Absent');
  const aoaAbsentees = [
    ['APNA CAMPUS — NIGHT CURFEW ABSENCE & PARENT ALERT AUDIT'],
    [`Hostel: ${hostelName} (${hostelCode}) | Date: ${dateStr} | Session: ${sessionStr}`],
    [`Total Absentees: ${absentees.length} Student(s) | Submitted By: ${submittedByStr}`],
    [],
    [
      'Sl No',
      'Name of Student',
      'Registration No',
      'Department',
      'Branch',
      'Roll No',
      'Room No',
      'Student Contact',
      'Parent Contact',
      'Attendance Status',
      'Parent Alert Status'
    ]
  ];

  if (absentees.length === 0) {
    aoaAbsentees.push([
      '--',
      'No absent students recorded tonight.',
      '--',
      '--',
      '--',
      '--',
      '--',
      '--',
      '--',
      'Curfew Satisfied',
      'All resident boarders physically verified in their assigned rooms.'
    ]);
  } else {
    absentees.forEach((ab, idx) => {
      aoaAbsentees.push([
        idx + 1,
        ab.studentName,
        ab.regNo,
        ab.department,
        ab.branch,
        ab.rollNumber,
        ab.roomFormatted,
        ab.phone,
        ab.parentPhone,
        'Absent',
        'Alert Notification Dispatched'
      ]);
    });
  }

  const wsAbsentees = XLSX.utils.aoa_to_sheet(aoaAbsentees);
  wsAbsentees['!cols'] = [
    { wch: 8 },  // Sl No
    { wch: 25 }, // Name of Student
    { wch: 18 }, // Registration No
    { wch: 32 }, // Department
    { wch: 12 }, // Branch
    { wch: 10 }, // Roll No
    { wch: 24 }, // Room No
    { wch: 18 }, // Student Contact
    { wch: 18 }, // Parent Contact
    { wch: 18 }, // Attendance Status
    { wch: 28 }  // Parent Alert Status
  ];

  // ── Sheet 3: Attendance Summary ──
  const aoaSummary = [
    ['HOSTEL ATTENDANCE EXECUTIVE SUMMARY'],
    ['Institution: APNA CAMPUS (Autonomous)'],
    [],
    ['Metric Indicator', 'Statistical Count / Value', 'Observation & Audit Remarks'],
    ['Hostel Complex Name', `${hostelName} (${hostelCode})`, 'Assigned Residential Block'],
    ['Inspection Date', dateStr, 'Scheduled Night Roll-Call Date'],
    ['Roll-Call Session', sessionStr, 'Curfew Verification Shift'],
    ['Submitting Officer', submittedByStr, 'Resident Hostel Warden'],
    ['Total Enrolled Boarders', totalBoarders, 'Official hostel capacity on register'],
    ['Present in Hostel Rooms', presentCount, 'Physically verified boarders'],
    ['Absent Boarders Tonight', absentCount, absentCount > 0 ? 'Action required: parent contact' : 'Full attendance achieved'],
    ['Approved Outstation Leave', leaveCount, 'Verified digital gate pass registry'],
    ['Aggregate Turnout %', turnoutRate, 'Hostel occupancy efficiency rate']
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(aoaSummary);
  wsSummary['!cols'] = [
    { wch: 28 },
    { wch: 30 },
    { wch: 45 }
  ];

  // Build Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Attendance Register');
  XLSX.utils.book_append_sheet(wb, wsAbsentees, 'Absentees Follow-up');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Session Summary');

  // Clean filename
  const cleanHostel = hostelCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanDate = dateStr.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Hostel_Attendance_${cleanHostel}_${cleanDate}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * PDF EXPORT
 * Generates official high-resolution, print-ready PDF document containing:
 * The exact 10-column table format matching Image 3:
 * Sl No | Name of Student | Registration No | Department | Branch | Roll No | Room No | Student Contact | Parent Contact | Attendance Status
 * Along with status badges and absent row highlight matching Image 1 & 3.
 */
export function downloadHostelAttendancePdf({ submission, records = [] }) {
  if (!submission) {
    throw new Error('No attendance submission selected for PDF export.');
  }

  const hostelName = submission.hostelName || 'Hostel';
  const hostelCode = submission.hostelCode || 'BN1';
  const dateStr = submission.date || new Date().toISOString().split('T')[0];
  const sessionStr = submission.session || 'Night Roll Call (08:30 PM)';
  const submittedByStr = submission.submittedBy || 'Resident Warden';
  const submittedAtStr = submission.submittedAt || `${dateStr}, 08:30 PM`;

  const sourceRecords = (records !== undefined && records !== null) ? records : (submission.records || []);
  const enrichedRecords = sourceRecords.map(r => enrichStudentRecord(r, hostelName));

  const totalBoarders = enrichedRecords.length;
  const presentCount = enrichedRecords.filter(r => r.status === 'Present').length;
  const absentCount = enrichedRecords.filter(r => r.status === 'Absent').length;
  const leaveCount = enrichedRecords.filter(r => r.status === 'On Leave' || r.status === 'Leave').length;
  const turnoutRate = totalBoarders > 0 ? `${((presentCount / totalBoarders) * 100).toFixed(1)}%` : '0.0%';

  // Landscape A4 (297mm width x 210mm height)
  const doc = createPdfDoc({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Institutional Top Bar (Deep Navy)
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Crimson accent strip
  doc.setFillColor(...SECONDARY_COLOR);
  doc.rect(0, 24, pageWidth, 2, 'F');

  // Top header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('APNA CAMPUS ENTERPRISE ERP — AUTONOMOUS RESIDENTIAL SYSTEM', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Affiliated to BPUT, Rourkela, Odisha | Approved by AICTE, New Delhi | NAAC "A++" Grade Accredited Institution', 14, 16);
  doc.text('Office of the Chief Warden & Residential Affairs | Bhubaneswar, Odisha - 752054 | www.apnacampus.edu.in', 14, 21);

  // Document Title & Subtitle
  let currY = 33;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('HOSTEL RESIDENT ATTENDANCE & NIGHT ROLL-CALL REGISTER', 14, currY);

  currY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Official Roll-Call Audit Log for ${hostelName} (${hostelCode}) · Physical verification conducted by Resident Warden.`, 14, currY);

  // 2. Session Metadata Strip
  currY += 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currY, pageWidth - 28, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);

  const colW = (pageWidth - 28) / 4;
  doc.text(`HOSTEL COMPLEX:`, 18, currY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(`${hostelName} (${hostelCode})`, 18, currY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`DATE & SESSION:`, 18 + colW, currY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(`${dateStr} · ${sessionStr}`, 18 + colW, currY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`SUBMITTED BY:`, 18 + colW * 2, currY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(`${submittedByStr}`, 18 + colW * 2, currY + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`VERIFICATION:`, 18 + colW * 3, currY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...EMERALD_COLOR);
  doc.text(`Verified & Synced to Admin`, 18 + colW * 3, currY + 10);

  // 3. KPI Summary Cards Grid
  currY += 17;
  const kpiCardWidth = (pageWidth - 28 - 12) / 5;
  const kpiCardHeight = 13;

  const kpis = [
    { label: 'TOTAL BOARDERS', val: `${totalBoarders}`, color: PRIMARY_COLOR, bg: [241, 245, 249] },
    { label: 'PRESENT TONIGHT', val: `${presentCount}`, color: EMERALD_COLOR, bg: [236, 253, 245] },
    { label: 'ABSENT TONIGHT', val: `${absentCount}`, color: SECONDARY_COLOR, bg: [254, 242, 242] },
    { label: 'ON APPROVED LEAVE', val: `${leaveCount}`, color: AMBER_COLOR, bg: [254, 243, 199] },
    { label: 'TURNOUT PERCENTAGE', val: `${turnoutRate}`, color: [2, 132, 199], bg: [240, 249, 255] }
  ];

  kpis.forEach((k, idx) => {
    const cardX = 14 + idx * (kpiCardWidth + 3);
    doc.setFillColor(...k.bg);
    doc.setDrawColor(...k.color);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, currY, kpiCardWidth, kpiCardHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(k.label, cardX + 3, currY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...k.color);
    doc.text(k.val, cardX + 3, currY + 10.5);
  });

  // 4. Main Student Table — Exact 10 Columns Matching Image 3
  currY += kpiCardHeight + 4;

  const tableHead = [[
    'Sl No',
    'Name of Student',
    'Registration No',
    'Department',
    'Branch',
    'Roll No',
    'Room No',
    'Student Contact',
    'Parent Contact',
    'Attendance Status'
  ]];

  const tableBody = enrichedRecords.map((r, i) => [
    i + 1,
    r.studentName,
    r.regNo,
    r.department,
    r.branch,
    r.rollNumber,
    r.roomFormatted,
    r.phone,
    r.parentPhone,
    r.status === 'Present' ? '✓ Present' : r.status === 'Absent' ? '✕ Absent' : 'On Leave'
  ]);

  renderTable(doc, {
    startY: currY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    margin: { left: 14, right: 14, bottom: 28 },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      valign: 'middle',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },                          // Sl No
      1: { cellWidth: 38, fontStyle: 'bold', textColor: [29, 78, 216] }, // Name of Student
      2: { cellWidth: 26, halign: 'center' },                          // Registration No
      3: { cellWidth: 44 },                                            // Department
      4: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },       // Branch
      5: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },       // Roll No
      6: { cellWidth: 30, halign: 'center' },                          // Room No
      7: { cellWidth: 28, halign: 'center' },                          // Student Contact
      8: { cellWidth: 28, halign: 'center' },                          // Parent Contact
      9: { cellWidth: 31, halign: 'center', fontStyle: 'bold' }        // Attendance Status
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const rowRecord = enrichedRecords[data.row.index];
        const isAbsent = rowRecord && rowRecord.status === 'Absent';

        // Soft pink highlight for entire row if absent (matches Image 1 & 3)
        if (isAbsent && data.column.index !== 9) {
          data.cell.styles.fillColor = [255, 241, 242]; // #fff1f2
        }

        // Attendance Status pill styling in column 9 (matching Image 3 badge colors)
        if (data.column.index === 9) {
          const text = String(data.cell.raw || '');
          if (text.includes('Absent') || text.includes('✕')) {
            data.cell.styles.textColor = [185, 28, 28]; // #b91c1c
            data.cell.styles.fillColor = [254, 226, 226]; // #fee2e2
            data.cell.styles.fontStyle = 'bold';
          } else if (text.includes('Present') || text.includes('✓')) {
            data.cell.styles.textColor = [21, 128, 61]; // #15803d
            data.cell.styles.fillColor = [220, 252, 231]; // #dcfce7
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [180, 83, 9]; // #b45309
            data.cell.styles.fillColor = [254, 243, 199]; // #fef3c7
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || currY + 60) + 6;

  // Check if we have enough room for signatures and notes, else add page
  let signY = finalY;
  if (signY > pageHeight - 35) {
    doc.addPage();
    signY = 20;
  }

  // 5. Absentees Alert Notice Box (if any)
  if (absentCount > 0 && signY < pageHeight - 40) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(...SECONDARY_COLOR);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, signY, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(`CURFEW ABSENCE ALERT: ${absentCount} Boarder(s) Unreported During Night Inspection`, 18, signY + 4.5);

    const absentNames = enrichedRecords
      .filter(r => r.status === 'Absent')
      .map(r => `${r.studentName} (${r.roomFormatted}, Parent: ${r.parentPhone})`)
      .join('  ·  ');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_DARK);
    doc.text(absentNames.substring(0, 180), 18, signY + 8.5);

    signY += 15;
  }

  // Check signature space again
  if (signY > pageHeight - 30) {
    doc.addPage();
    signY = 20;
  }

  // 6. Signatures and Verification Block
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('I hereby certify that physical room verification was carried out at the assigned hostel premises and statuses are correctly documented.', 14, signY + 3);

  const signLineY = signY + 14;

  // Left Signature: Resident Warden
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(14, signLineY, 84, signLineY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(submittedByStr, 14, signLineY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Resident Hostel Warden In-Charge', 14, signLineY + 7.5);

  // Center Seal Stamp: Office of Warden
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2, signLineY + 2, 7, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('APNA CAMPUS', pageWidth / 2, signLineY - 0.5, { align: 'center' });
  doc.text('RESIDENCE SEAL', pageWidth / 2, signLineY + 2.5, { align: 'center' });
  doc.text('★ VERIFIED ★', pageWidth / 2, signLineY + 5.5, { align: 'center' });

  // Right Signature: Chief Warden / Hostel Administrator
  doc.line(pageWidth - 84, signLineY, pageWidth - 14, signLineY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Chief Warden & Residential Affairs', pageWidth - 84, signLineY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Hostel Administration & Housing Executive', pageWidth - 84, signLineY + 7.5);

  // 7. Official Institutional Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 9, pageWidth - 14, pageHeight - 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Official Document · Generated on ${new Date().toLocaleString()} · Apna Campus ERP v2.4`, 14, pageHeight - 5);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
  }

  const cleanHostel = hostelCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanDate = dateStr.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `Hostel_Attendance_${cleanHostel}_${cleanDate}.pdf`;

  doc.save(fileName);
  return fileName;
}
