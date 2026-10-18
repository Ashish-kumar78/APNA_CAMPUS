import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BISHNU_CANDIDATE_PHOTO, ADMIT_SIG_CENTER_SUP, ADMIT_SIG_CONTROLLER } from './admitCardAssets';

// Safe constructor helper for both ESM and CJS bundling contexts
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

// Institutional branding colors
const PRIMARY_COLOR = [15, 43, 72];    // Deep Navy
const SECONDARY_COLOR = [220, 38, 38]; // Crimson Red
const ACCENT_COLOR = [2, 132, 199];    // Sky Blue
const TEXT_DARK = [15, 23, 42];        // Slate 900
const TEXT_MUTED = [100, 116, 139];    // Slate 500

/**
 * Draws standard institutional header on PDF document
 */
function addInstitutionalHeader(doc, docTitle, subTitle = '') {
  // Top decorative bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 26, 'F');
  
  // Crimson accent strip
  doc.setFillColor(...SECONDARY_COLOR);
  doc.rect(0, 26, doc.internal.pageSize.getWidth(), 2, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('APNA CAMPUS ENTERPRISE ERP', 14, 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Affiliated to BPUT, Rourkela, Odisha | Approved by AICTE, New Delhi | NAAC "A" Grade Accredited', 14, 17);
  doc.text('Bhubaneswar, Odisha - 752054 | www.apnacampus.edu.in | ERP Academic System', 14, 22);

  // Document title header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(docTitle.toUpperCase(), 14, 38);

  if (subTitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(subTitle, 14, 44);
  }

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 48, doc.internal.pageSize.getWidth() - 14, 48);
}

/**
 * Adds official institutional footer with verification watermark
 */
function addInstitutionalFooter(doc, pageNumber = 1, totalPages = 1) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('This is a computer-generated official academic document authenticated via BPUT ERP Gateway.', 14, pageHeight - 10);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, pageHeight - 6);

  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  doc.text('Authorized Academic Office Signature', pageWidth - 14, pageHeight - 6, { align: 'right' });
}

/**
 * Draws an official verification stamp / seal box
 */
function drawOfficialSeal(doc, x, y, title = 'BPUT AUTONOMOUS') {
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1);
  doc.roundedRect(x, y, 46, 20, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, x + 23, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text('OFFICIALLY VERIFIED', x + 23, y + 11, { align: 'center' });

  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(new Date().toLocaleDateString('en-IN'), x + 23, y + 16, { align: 'center' });
}

// -------------------------------------------------------------
// 1. Digital Student ID Card Pass PDF
// -------------------------------------------------------------
export function downloadIdCardPdf(studentData = {}) {
  const doc = createPdfDoc({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  addInstitutionalHeader(doc, 'Digital Campus Identity Pass', 'Secure Student RFID & Examination Authorization Credential');

  const student = {
    name: studentData.name || 'Aarav Sharma',
    rollNo: studentData.rollNo || studentData.rollNumber || '2301289140',
    course: studentData.course || 'B.Tech',
    branch: studentData.branch || 'Computer Science & Engineering',
    semester: studentData.semester || '7th Semester',
    bloodGroup: studentData.bloodGroup || 'O+',
    rfidTag: studentData.rfidTag || 'RF-882194',
    hostel: studentData.hostel || 'Block C - Room 204',
    validity: '2023 - 2027',
    contact: studentData.contact || '+91 98765 43210'
  };

  // Card Outer Container (Badge format)
  const cardX = 25;
  const cardY = 56;
  const cardW = 160;
  const cardH = 96;

  // Badge background card with shadow style border
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1.5);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD');

  // Top badge ribbon
  doc.setFillColor(...PRIMARY_COLOR);
  doc.roundedRect(cardX, cardY, cardW, 20, 4, 4, 'F');
  doc.rect(cardX, cardY + 16, cardW, 4, 'F'); // square bottom edges of ribbon

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('APNA CAMPUS, BHUBANESWAR', cardX + 8, cardY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text('Affiliated to BPUT, Odisha | NAAC "A" Grade Accredited', cardX + 8, cardY + 14);

  // Validity pill in top right
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(cardX + cardW - 38, cardY + 5, 32, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(`VALID: ${student.validity}`, cardX + cardW - 22, cardY + 11.5, { align: 'center' });

  // Photo Box
  const photoX = cardX + 10;
  const photoY = cardY + 28;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.roundedRect(photoX, photoY, 32, 40, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('STUDENT', photoX + 16, photoY + 18, { align: 'center' });
  doc.text('PHOTO', photoX + 16, photoY + 24, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('DIGITAL PASS', photoX + 16, photoY + 30, { align: 'center' });

  // Student Details inside Badge
  const infoX = photoX + 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(student.name, infoX, photoY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SECONDARY_COLOR);
  doc.text(`REG NO / ROLL: ${student.rollNo}`, infoX, photoY + 12);

  // Two column grid for details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);

  const leftX = infoX;
  const rightX = infoX + 54;
  let currY = photoY + 19;

  doc.text(`Program: ${student.course}`, leftX, currY);
  doc.text(`Semester: ${student.semester}`, rightX, currY);
  currY += 6;
  doc.text(`Branch: ${student.branch}`, leftX, currY);
  doc.text(`Blood Group: ${student.bloodGroup}`, rightX, currY);
  currY += 6;
  doc.text(`RFID Chip: ${student.rfidTag}`, leftX, currY);
  doc.text(`Hostel: ${student.hostel}`, rightX, currY);
  currY += 6;
  doc.text(`Emergency: ${student.contact}`, leftX, currY);
  doc.text(`Library UID: LIB-${student.rollNo}`, rightX, currY);

  // Bottom card strip with Barcode simulation and QR code mock
  doc.setFillColor(241, 245, 249);
  doc.rect(cardX + 1, cardY + cardH - 22, cardW - 2, 21, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(cardX, cardY + cardH - 22, cardX + cardW, cardY + cardH - 22);

  // Simulated Barcode
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...TEXT_DARK);
  doc.text('||| | |||| || ||| | ||| || ||| ||||', cardX + 10, cardY + cardH - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`CODE-128: ${student.rollNo}-BPUT-AUTH`, cardX + 10, cardY + cardH - 5);

  // QR Code Mock block
  const qrX = cardX + cardW - 32;
  const qrY = cardY + cardH - 20;
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX, qrY, 18, 18, 'FD');
  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('[QR]', qrX + 9, qrY + 10, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(37, 99, 235);
  doc.text('CHIP ACTIVE', cardX + cardW - 12, qrY + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Registrar / Principal', cardX + cardW - 12, qrY + 14, { align: 'right' });

  // Instructions below the badge
  const instY = cardY + cardH + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('TERMS OF USAGE & CAMPUS RULES', 14, instY);

  const instructions = [
    '1. This digital identity pass is recognized across Apna Campus turnstiles, libraries, and mess facilities.',
    '2. For University End-Semester Examinations, students must present this document or smart badge.',
    '3. Transfer or duplication of this smart pass is strictly prohibited under BPUT Disciplinary By-laws.',
    '4. In case of lost credentials, contact Student Affairs or email: support@apnacampus.edu.in immediately.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  instructions.forEach((line, idx) => {
    doc.text(line, 14, instY + 6 + (idx * 5));
  });

  drawOfficialSeal(doc, 150, instY + 6, 'BPUT AUTONOMOUS');
  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Student_ID_Pass_${student.rollNo}.pdf`);
}

// -------------------------------------------------------------
// 2. Official College Fee Receipt PDF
// -------------------------------------------------------------
// -------------------------------------------------------------
// -------------------------------------------------------------
// 2. Official GIFT Autonomous College Fee Receipt PDF (Matching Image 5)
// -------------------------------------------------------------

export function convertNumberToIndianWords(num) {
  const n = Math.round(Number(num) || 0);
  if (isNaN(n) || n === 0) return 'zero Rupees Only';

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function helper(number) {
    if (number === 0) return '';
    if (number < 20) return ones[number] + ' ';
    if (number < 100) return tens[Math.floor(number / 10)] + ' ' + helper(number % 10);
    if (number < 1000) return ones[Math.floor(number / 100)] + 'hundred ' + helper(number % 100);
    if (number < 100000) return helper(Math.floor(number / 1000)) + 'thousands ' + helper(number % 1000);
    if (number < 10000000) return helper(Math.floor(number / 100000)) + 'lakh ' + helper(number % 100000);
    return helper(Math.floor(number / 10000000)) + 'crore ' + helper(number % 10000000);
  }

  const words = helper(n).trim().replace(/\s+/g, ' ');
  return `${words} Rupees Only`;
}

export function drawGiftLogo(doc, x, y, size = 26, isWatermark = false) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.40;

  const cyanColor = isWatermark ? [195, 232, 252] : [0, 153, 230];
  const redColor = isWatermark ? [252, 205, 205] : [229, 57, 53];

  // 16 Gear teeth
  const teethCount = 16;
  const toothWidth = size * 0.085;
  const toothHeight = size * 0.12;

  for (let i = 0; i < teethCount; i++) {
    const angle = (i * 2 * Math.PI) / teethCount - Math.PI / 2;
    const toothColor = (i >= 0 && i <= 4) ? redColor : cyanColor;
    doc.setFillColor(...toothColor);
    doc.setDrawColor(...toothColor);

    const tx = cx + Math.cos(angle) * (r + toothHeight / 2);
    const ty = cy + Math.sin(angle) * (r + toothHeight / 2);

    const hw = toothWidth / 2;
    const hh = toothHeight / 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const p1 = [tx - hw * sinA - hh * cosA, ty + hw * cosA - hh * sinA];
    const p2 = [tx + hw * sinA - hh * cosA, ty - hw * cosA - hh * sinA];
    const p3 = [tx + hw * sinA + hh * cosA, ty - hw * cosA + hh * sinA];
    const p4 = [tx - hw * sinA + hh * cosA, ty + hw * cosA + hh * sinA];

    doc.triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], 'F');
    doc.triangle(p1[0], p1[1], p3[0], p3[1], p4[0], p4[1], 'F');
  }

  // Rim ring
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, r, 'F');
  doc.setLineWidth(isWatermark ? 0.8 : 1.2);
  doc.setDrawColor(...cyanColor);
  doc.circle(cx, cy, r, 'S');

  // Inner ring
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, r * 0.92, 'S');

  // Diya flame & lamp at top inside
  doc.setFillColor(...redColor);
  doc.setDrawColor(...redColor);
  const flameY = cy - r * 0.45;
  doc.circle(cx, flameY, size * 0.045, 'F');
  doc.rect(cx - size * 0.08, cy - r * 0.28, size * 0.16, size * 0.035, 'F');

  // Bold text: APNA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(size * 0.28);
  doc.setTextColor(...cyanColor);
  doc.text('APNA', cx, cy + size * 0.06, { align: 'center' });

  // Book line art below GIFT
  doc.setDrawColor(...redColor);
  doc.setLineWidth(isWatermark ? 0.4 : 0.6);
  const bookY = cy + r * 0.45;
  const bW = size * 0.16;
  doc.line(cx, bookY - 1, cx, bookY + size * 0.1);
  doc.line(cx, bookY, cx - bW, bookY - size * 0.04);
  doc.line(cx - bW, bookY - size * 0.04, cx - bW, bookY + size * 0.06);
  doc.line(cx - bW, bookY + size * 0.06, cx, bookY + size * 0.1);

  doc.line(cx, bookY, cx + bW, bookY - size * 0.04);
  doc.line(cx + bW, bookY - size * 0.04, cx + bW, bookY + size * 0.06);
  doc.line(cx + bW, bookY + size * 0.06, cx, bookY + size * 0.1);
}

export function buildGiftFeeReceiptDoc(receipt = {}, studentInfo = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. Watermark in center of the page
  drawGiftLogo(doc, 75, 115, 60, true);

  // 2. Top Header - Logo and College Details
  drawGiftLogo(doc, 18, 14, 25, false);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.text('Gandhi Institute for Technology (GIFT)', 46, 20);

  doc.setFontSize(13);
  doc.text('(Autonomous)', 46, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('At- Gramadiha, P.o- Gangapada', 46, 32);

  // 3. Top dividing line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(18, 38, 192, 38);

  // 4. Centered Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Fees Receipt (Student Copy)', 105, 44, { align: 'center' });

  // Resolve fields
  const regdNo = receipt.registrationNumber || receipt.rollNumber || studentInfo.rollNumber || studentInfo.registrationNumber || studentInfo.rollNo || '2401432265';
  const name = (receipt.studentName || studentInfo.name || 'BISHNU PRASAD SAHOO').toUpperCase();
  const courseBatch = receipt.courseBatch || studentInfo.batch || 'BTECH 2028-P';
  const section = receipt.section || studentInfo.section || 'CSE (AI) - Genius';

  const receiptNo = receipt.receiptNo || receipt.no || `GIFT/ACC/${receipt.id ? String(receipt.id).replace(/\D/g, '') || '128680' : '128680'}`;
  const receiptDate = receipt.receiptDate || receipt.date || receipt.paymentDate || '27-07-2026';

  const amount = Number(receipt.amount || receipt.paid || 20000);
  const amountWords = convertNumberToIndianWords(amount);
  const mode = receipt.mode || receipt.paymentMethod || 'Bank Transfer';
  const txnId = receipt.transactionId || receipt.txnId || receipt.id || '126928800409';
  const feeHead = receipt.head || receipt.feeHead || receipt.remarks || 'Tuition Fee';

  // 5. Two-column Metadata
  const leftX = 18;
  const rightX = 135;
  const startY = 52;
  const rowH = 5.5;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Regd. No : ', leftX, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(String(regdNo), leftX + 18, startY);

  doc.setFont('helvetica', 'bold');
  doc.text('Name : ', leftX, startY + rowH);
  doc.text(name, leftX + 14, startY + rowH);

  doc.text('Course/Batch: ', leftX, startY + rowH * 2);
  doc.setFont('helvetica', 'normal');
  doc.text(courseBatch, leftX + 24, startY + rowH * 2);

  doc.setFont('helvetica', 'bold');
  doc.text('Section: ', leftX, startY + rowH * 3);
  doc.setFont('helvetica', 'normal');
  doc.text(section, leftX + 15, startY + rowH * 3);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('No. : ', rightX, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNo, rightX + 10, startY);

  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Date : ', rightX, startY + rowH);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptDate, rightX + 24, startY + rowH);

  // 6. Body Statement
  const statementY = startY + rowH * 4 + 4;
  doc.setFontSize(9.5);
  const cleanTxn = String(txnId).replace(/[^a-zA-Z0-9]/g, '');
  const statement = `Received RS. ${amount.toLocaleString('en-IN')}.00 (${amountWords}) by ${mode} transcation id-${cleanTxn} on ${receiptDate} from ${name} towards ${feeHead}.`;
  
  const splitStatement = doc.splitTextToSize(statement, 174);
  doc.text(splitStatement, 18, statementY);

  // 7. Bottom dividing line
  const bottomLineY = statementY + (splitStatement.length * 5) + 3;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(18, bottomLineY, 192, bottomLineY);

  // 8. Disclaimer Footer
  const disclaimerY = bottomLineY + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(40, 40, 40);
  const disclaimer = "This money receipt is computer generated by the student through his/her CMS login and does not require the Accountant's signature or the Institute's stamp in order to be considered valid. This is a duplicate money receipt and the original receipt is available with Accounts Department.";
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 174);
  doc.text(splitDisclaimer, 18, disclaimerY);

  const cleanFileName = `Fee_Receipt_${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  return { doc, receiptNo, fileName: cleanFileName };
}

export function buildFeeReceiptDoc(receipt = {}, studentInfo = {}) {
  return buildGiftFeeReceiptDoc(receipt, studentInfo);
}

export function downloadFeeReceiptPdf(receipt = {}, studentInfo = {}) {
  const { doc, receiptNo } = buildGiftFeeReceiptDoc(receipt, studentInfo);
  doc.save(`Fee_Receipt_${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}

export function openFeeReceiptPdf(receipt = {}, studentInfo = {}) {
  const { doc, receiptNo } = buildGiftFeeReceiptDoc(receipt, studentInfo);
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('Failed to open fee receipt PDF in new window, downloading instead:', err);
    doc.save(`Fee_Receipt_${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
  }
}

export function buildPaymentProofDoc(proof = {}) {
  return buildGiftFeeReceiptDoc(proof, {
    name: proof.studentName || 'BISHNU PRASAD SAHOO',
    rollNumber: proof.rollNumber || '2401432265',
    batch: 'BTECH 2028-P',
    section: 'CSE (AI) - Genius'
  });
}

export function openPaymentProofPdf(proof = {}) {
  const { doc, receiptNo } = buildPaymentProofDoc(proof);
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('Failed to open generated proof PDF in new window, downloading instead:', err);
    doc.save(`Fee_Receipt_${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
  }
}

export function downloadPaymentProofPdf(proof = {}) {
  const { doc, receiptNo } = buildPaymentProofDoc(proof);
  doc.save(`Fee_Receipt_${receiptNo.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
}


// -------------------------------------------------------------
// 2B. GIFT Autonomous Examination Admit Card (Matching Screenshot)
// -------------------------------------------------------------
export function drawOfficialAdmitStamp(doc, x, y, title1, title2) {
  doc.setDrawColor(124, 58, 237);
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(x, y, 48, 12, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(109, 40, 217);
  doc.text(title1, x + 24, y + 5, { align: 'center' });
  doc.setFontSize(6.8);
  doc.text(title2, x + 24, y + 9.5, { align: 'center' });
}

export function buildGiftAdmitCardDoc(exam = {}, studentInfo = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); // 210

  // 1. Background Watermark (GIFT Cogwheel Logo in center of schedule table)
  drawGiftLogo(doc, (pageWidth - 75) / 2, 95, 75, true);

  // 2. Header
  // Top left GIFT Logo
  drawGiftLogo(doc, 14, 10, 25, false);

  // Top Center text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('APNA CAMPUS, BHUBANESWAR', (pageWidth / 2) + 6, 17, { align: 'center' });

  doc.setFontSize(11);
  doc.text('ADMIT CARD', (pageWidth / 2) + 6, 23, { align: 'center' });
  const admitWidth = doc.getTextWidth('ADMIT CARD');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(((pageWidth / 2) + 6) - (admitWidth / 2), 24, ((pageWidth / 2) + 6) + (admitWidth / 2), 24);

  const examName = exam.name || '4th Semester End Semester Examination 2025-26';
  doc.setFontSize(9.5);
  doc.text(examName, (pageWidth / 2) + 6, 29, { align: 'center' });

  // 3. Candidate Details Box (Left) and Photo (Right)
  const regdNo = studentInfo.registrationNumber || studentInfo.rollNumber || '2401432265';
  const name = (studentInfo.name || 'BISHNU PRASAD SAHOO').toUpperCase();
  const dob = studentInfo.dobFormatted || studentInfo.dob || '04/03/2007';
  const courseBatch = studentInfo.courseBatchFull || 'BTECH 2028-P (Branch:- Computer Science & Engineering (Artificial Intelligence))';

  const leftBoxX = 14;
  const leftBoxY = 34;
  const leftBoxW = 145;
  const photoX = 163;
  const photoY = 34;
  const photoW = 24;
  const photoH = 30;

  const detailRows = [
    ['Registration No.', `-  ${regdNo}`],
    ["Candidate's Name", `-  ${name}`],
    ['Date of Birth', `-  ${dob}`],
    ['Course/Batch', `-  ${courseBatch}`],
  ];

  renderTable(doc, {
    startY: leftBoxY,
    margin: { left: leftBoxX },
    tableWidth: leftBoxW,
    body: detailRows,
    theme: 'grid',
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      cellPadding: 1.5,
      fontSize: 7.2,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 113, fontStyle: 'bold' }
    }
  });

  const leftBoxFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : leftBoxY + 28;

  // Render Candidate Photo
  try {
    if (BISHNU_CANDIDATE_PHOTO) {
      doc.addImage(BISHNU_CANDIDATE_PHOTO, 'PNG', photoX, photoY, photoW, photoH);
    } else {
      doc.setFillColor(240, 243, 248);
      doc.rect(photoX, photoY, photoW, photoH, 'F');
    }
  } catch (err) {
    doc.setFillColor(240, 243, 248);
    doc.rect(photoX, photoY, photoW, photoH, 'F');
  }
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(photoX, photoY, photoW, photoH, 'S');

  // Candidate's Signature label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("Candidate's Signature", photoX + (photoW / 2), photoY + photoH + 5, { align: 'center' });

  // 4. Schedule of Examination Title
  const schedTitleY = Math.max(leftBoxFinalY, photoY + photoH + 6) + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Schedule of Examination', pageWidth / 2, schedTitleY, { align: 'center' });

  // 5. Schedule Table
  const defaultSubs = [
    { sl: 1, dateFull: '06/05/2026 (Wednesday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-403', name: 'Programming with Python' },
    { sl: 2, dateFull: '07/05/2026 (Thursday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-402', name: 'Computer Organization & Architecture' },
    { sl: 3, dateFull: '08/05/2026 (Friday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTCS-T-PC-401', name: 'Design and Analysis of Algorithms' },
    { sl: 4, dateFull: '09/05/2026 (Saturday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTEC-T-OE-401', name: 'Digital Signal Processing' },
    { sl: 5, dateFull: '11/05/2026 (Monday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTBS-T-HS-302', name: 'Engineering Economics' },
    { sl: 6, dateFull: '12/05/2026 (Tuesday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTMC-T-MC-302', name: 'EIKT' },
    { sl: 7, dateFull: '13/05/2026 (Wednesday)', sitting: '2nd', time: '12.00 PM - 03.00 PM', code: 'BTSC-T-AE-401', name: 'Ability Enhancement Training -C' },
  ];

  const subjects = (exam.subjects && exam.subjects.length > 0) ? exam.subjects : defaultSubs;

  const schedRows = subjects.map(s => [
    s.sl,
    s.dateFull || `${s.date}`,
    s.sitting || '2nd',
    s.time || '12.00 PM - 03.00 PM',
    s.code,
    s.name
  ]);

  renderTable(doc, {
    startY: schedTitleY + 2.5,
    margin: { left: 14, right: 14 },
    head: [['Sl.', 'Date', 'Sitting', 'Time', 'Subject Code', 'Subject Name']],
    body: schedRows,
    theme: 'grid',
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      cellPadding: 1.6,
      fontSize: 6.8,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 34, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 58, halign: 'left', fontStyle: 'bold' },
    }
  });

  const tableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 125;

  // 6. Signatures & Official Stamps
  const sigY = tableFinalY + 3;
  try {
    if (ADMIT_SIG_CENTER_SUP) {
      doc.addImage(ADMIT_SIG_CENTER_SUP, 'PNG', 16, sigY, 46, 22);
    } else {
      drawOfficialAdmitStamp(doc, 16, sigY + 8, 'Center Superintendent', 'Apna Campus, Bhubaneswar');
    }
  } catch (err) {
    drawOfficialAdmitStamp(doc, 16, sigY + 8, 'Center Superintendent', 'Apna Campus, Bhubaneswar');
  }

  try {
    if (ADMIT_SIG_CONTROLLER) {
      doc.addImage(ADMIT_SIG_CONTROLLER, 'PNG', 140, sigY, 46, 22);
    } else {
      drawOfficialAdmitStamp(doc, 140, sigY + 8, 'Controller of Examinations', 'Apna Campus (Autonomous), Bhubaneswar');
    }
  } catch (err) {
    drawOfficialAdmitStamp(doc, 140, sigY + 8, 'Controller of Examinations', 'Apna Campus (Autonomous), Bhubaneswar');
  }

  // 7. Instructions
  const instY = sigY + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(0, 0, 0);
  doc.text('*Instruction (s)', 14, instY);

  const instructions = [
    'i. This Admit Card is issued on the basis of student data filled in on-line by the college.',
    'ii. A Candidate is required to bring his / her Registration / Identity Card and Identity Proof to the Examination Hall.',
    'iii. A Candidate detected with possession of Mobile Phone / Pager and any Objectionable Electronic Gadgets inside the Examination Hall will be debarred and punishable as per Regulation of the University.',
    'iv. A candidate shall report the Invigilator and / Centre Superintendent in case of wrong photograph or discrepancies and the Centre Superintendent shall permit only after verification with the University Registration Card and valid Vote Id / Aadhar Card.',
    'v. The Centre Superintendent shall permit a candidate to appear in subject (s), if he / she has registered, eligible and subject (s) are available in the University Schedule and Admit Card.',
    'vi. The Centre Superintendent shall make permissible arrangement for physically challenged / blind candidates with required supporting documents as per rules.',
    'vii. The Result will be published subject to fulfilment of all academic regulations for the course in force of the university.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  let curInstY = instY + 4;
  instructions.forEach((inst) => {
    const splitLines = doc.splitTextToSize(inst, 182);
    splitLines.forEach((l) => {
      doc.text(l, 18, curInstY);
      curInstY += 3.7;
    });
  });

  // 8. Footer divider and text
  const footerY = 278;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Apna Campus Autonomous Institution, Bhubaneswar', 14, footerY + 5);

  const printDate = '18-10-2026';
  doc.text(`Printed @ ${printDate}`, pageWidth - 14, footerY + 5, { align: 'right' });

  return doc;
}

export function downloadGiftAdmitCardPdf(exam = {}, studentInfo = {}) {
  const doc = buildGiftAdmitCardDoc(exam, studentInfo);
  const cleanSem = (exam.name || 'Admit_Card').replace(/[^a-zA-Z0-9_-]/g, '_');
  const regd = studentInfo.registrationNumber || studentInfo.rollNumber || '2401432265';
  doc.save(`GIFT_AdmitCard_${regd}_${cleanSem}.pdf`);
}

export function openGiftAdmitCardPdf(exam = {}, studentInfo = {}) {
  const doc = buildGiftAdmitCardDoc(exam, studentInfo);
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    downloadGiftAdmitCardPdf(exam, studentInfo);
  }
}


// -------------------------------------------------------------
// 3. Examination Grade Card / Marksheet PDF
// -------------------------------------------------------------
export function downloadGradeCardPdf(examData = {}, studentInfo = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Semester Grade Card & Academic Marksheet', 'Autonomous Examination Branch • BPUT Rourkela');

  const rollNo = studentInfo.rollNo || studentInfo.rollNumber || '2301289140';
  const name = studentInfo.name || 'Aarav Sharma';
  const semester = examData.semester || '5th Semester';
  const sgpa = examData.sgpa || '8.64';
  const result = examData.result || 'PASSED';

  // Candidate Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, doc.internal.pageSize.getWidth() - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`NAME: ${name.toUpperCase()}`, 20, 60);
  doc.text(`REG NO: ${rollNo}`, 125, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('Program: Bachelor of Technology (B.Tech)', 20, 67);
  doc.text('Discipline: Computer Science & Engineering', 125, 67);
  doc.text(`Examination: ${semester} Regular Examination 2025-26`, 20, 73);
  doc.text('College Code: 204 (Apna Campus)', 125, 73);

  // Subject rows
  const subjects = examData.subjects || [
    { code: 'CS501', name: 'Artificial Intelligence', credits: 4, internal: 18, external: 72, total: 90, grade: 'O', points: 10 },
    { code: 'CS502', name: 'Machine Learning', credits: 4, internal: 19, external: 68, total: 87, grade: 'A+', points: 9 },
    { code: 'CS503', name: 'Cloud Computing & DevOps', credits: 3, internal: 17, external: 65, total: 82, grade: 'A', points: 8.5 },
    { code: 'CS504', name: 'Compiler Design', credits: 3, internal: 16, external: 64, total: 80, grade: 'A', points: 8.5 },
    { code: 'CS511', name: 'AI & Data Science Laboratory', credits: 2, internal: 20, external: 75, total: 95, grade: 'O', points: 10 },
    { code: 'CS512', name: 'Cloud Infrastructure Lab', credits: 2, internal: 19, external: 71, total: 90, grade: 'O', points: 10 }
  ];

  const body = subjects.map((sub, idx) => [
    idx + 1,
    sub.code,
    sub.name,
    sub.credits || 3,
    sub.internal,
    sub.external,
    sub.total,
    sub.grade,
    sub.points
  ]);

  renderTable(doc, {
    startY: 83,
    head: [['#', 'Code', 'Course / Subject Title', 'Credits', 'Int (20)', 'Ext (80)', 'Total (100)', 'Grade', 'Points']],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 70 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 16, halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Performance Summary Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, doc.internal.pageSize.getWidth() - 28, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('SEMESTER SGPA:', 20, finalY + 9);
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(String(sgpa), 60, finalY + 10);

  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('CUMULATIVE CGPA:', 95, finalY + 9);
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text('8.42', 140, finalY + 10);

  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`RESULT STATUS: ${result.toUpperCase()}`, 20, finalY + 18);
  doc.text('TOTAL CREDITS EARNED: 18', 95, finalY + 18);

  // Signature Blocks
  const sigY = finalY + 32;
  drawOfficialSeal(doc, 14, sigY, 'EXAM BRANCH');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Controller of Examinations', 135, sigY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Biju Patnaik University of Technology (BPUT)', 135, sigY + 18);

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Grade_Card_${semester.replace(/\s+/g, '_')}_${rollNo}.pdf`);
}

// -------------------------------------------------------------
// 3b. Examination Admit Card / Hall Ticket PDF
// -------------------------------------------------------------
export function downloadAdmitCardPdf(schedule = [], studentInfo = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Examination Admit Card & Hall Ticket', 'BPUT Autonomous Examination Branch • Internal Assessment & Midterms');

  const rollNo = studentInfo.rollNo || studentInfo.rollNumber || '2301289140';
  const name = studentInfo.name || 'Aarav Sharma';

  // Candidate Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, doc.internal.pageSize.getWidth() - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`CANDIDATE: ${name.toUpperCase()}`, 20, 60);
  doc.text(`REG NO: ${rollNo}`, 125, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('Course: B.Tech (Computer Science & Engineering)', 20, 67);
  doc.text('Examination Center: Academic Block 2, Exam Hall-A', 125, 67);
  doc.text('Session: Autumn 2026-27 | 5th Semester', 20, 74);
  doc.text('Roll Tag / Desk Code: DESK-CSE-042', 125, 74);

  const defaultSchedule = [
    ['1', '15 Oct 2026', '10:00 AM - 11:30 AM', 'CS501', 'Artificial Intelligence', 'Hall-A', 'Verified [  ]'],
    ['2', '17 Oct 2026', '10:00 AM - 11:30 AM', 'CS502', 'Machine Learning', 'Hall-B', 'Verified [  ]'],
    ['3', '20 Oct 2026', '02:00 PM - 03:30 PM', 'CS503', 'Cloud Computing', 'Hall-A', 'Verified [  ]'],
    ['4', '22 Oct 2026', '10:00 AM - 11:30 AM', 'CS504', 'Compiler Design', 'Hall-C', 'Verified [  ]']
  ];

  renderTable(doc, {
    startY: 86,
    head: [['#', 'Exam Date', 'Reporting Time', 'Code', 'Course / Subject Title', 'Hall', 'Invigilator Sign']],
    body: defaultSchedule,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 34 },
      3: { cellWidth: 18, fontStyle: 'bold' },
      4: { cellWidth: 50 },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 26, halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('MANDATORY EXAM HALL PROTOCOLS:', 14, finalY);

  const instructions = [
    '1. Students must carry this printed Admit Card along with their College RFID Smart Card.',
    '2. Electronic devices, smartwatches, and programmable calculators are strictly banned inside the hall.',
    '3. Students will not be permitted to enter the examination hall 15 minutes after commencement.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_DARK);
  instructions.forEach((ins, idx) => {
    doc.text(ins, 14, finalY + 5 + (idx * 4.5));
  });

  drawOfficialSeal(doc, 14, finalY + 22, 'EXAM CELL');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Controller of Examinations', 135, finalY + 34);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Autonomous Examination Division • GIFT', 135, finalY + 38);

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Admit_Card_${rollNo}_Internal_Assessment.pdf`);
}

// -------------------------------------------------------------
// 3b. Exam Hall Door Chart & Seating Allocation PDF
// -------------------------------------------------------------
export function downloadDoorChartPdf(hall = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addInstitutionalHeader(doc, 'Examination Hall Door Chart & Seating Plan', 'Office of Controller of Examinations • Autonomous Examination Division');

  const hallName = hall.hall || 'Exam Hall B-301';
  const session = hall.session || 'Morning (10:00 AM - 01:00 PM)';
  const invigilator = hall.invigilator || 'Faculty Invigilator';
  const range = hall.range || 'Roll Range (Allocated Candidates)';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`EXAMINATION HALL: ${hallName.toUpperCase()}`, 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Session: ${session} | Capacity: ${hall.capacity || 60} Desks | Allocated: ${hall.allocated || 58}`, 14, 52);
  doc.text(`Invigilator: ${invigilator}`, 14, 57);
  doc.text(`Allocated Candidate Range: ${range}`, 14, 62);

  const bodyData = [];
  const startRoll = 2305201001;
  const count = hall.allocated || 58;
  for (let i = 0; i < count; i += 2) {
    const roll1 = String(startRoll + i);
    const roll2 = i + 1 < count ? String(startRoll + i + 1) : '-';
    bodyData.push([
      `DESK-${String(i + 1).padStart(2, '0')}`,
      roll1,
      'CSE (Sem 5)',
      `DESK-${String(i + 2).padStart(2, '0')}`,
      roll2,
      roll2 !== '-' ? 'CSE (Sem 5)' : '-'
    ]);
  }

  renderTable(doc, {
    startY: 68,
    head: [['Desk #', 'Roll Number', 'Branch/Sem', 'Desk #', 'Roll Number', 'Branch/Sem']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 20, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 32, fontStyle: 'bold' },
      5: { cellWidth: 38 }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || 180) + 10;
  drawOfficialSeal(doc, 14, finalY, 'EXAM CELL');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Chief Superintendent / CoE', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Autonomous Examination Cell • GIFT', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);
  doc.save(`Door_Chart_${hallName.replace(/\s+/g, '_')}.pdf`);
}

// -------------------------------------------------------------
// 3c. Master Autonomous Examination Timetable PDF
// -------------------------------------------------------------
export function downloadExamTimetableMasterPdf(timetable = []) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addInstitutionalHeader(doc, 'Master Autonomous Examination Schedule', 'Office of Controller of Examinations • Autumn 2026-27');

  const bodyData = timetable.map((t, idx) => [
    String(idx + 1),
    t.date,
    t.time,
    t.code,
    t.subject,
    t.semester,
    Array.isArray(t.branches) ? t.branches.join(', ') : t.branches
  ]);

  renderTable(doc, {
    startY: 52,
    head: [['#', 'Exam Date', 'Time Session', 'Code', 'Course / Subject Title', 'Semester', 'Branches']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 32 },
      3: { cellWidth: 18, fontStyle: 'bold' },
      4: { cellWidth: 50 },
      5: { cellWidth: 22 },
      6: { cellWidth: 26 }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || 160) + 10;
  drawOfficialSeal(doc, 14, finalY, 'EXAM CELL');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Controller of Examinations', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Autonomous Examination Division • GIFT', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);
  doc.save('Autonomous_Examination_Master_Timetable.pdf');
}


// -------------------------------------------------------------
// 4. Class Timetable / Schedule PDF
// -------------------------------------------------------------
export function downloadTimetablePdf(scheduleData = {}) {
  const doc = createPdfDoc({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Landscape header
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 24, 'F');
  doc.setFillColor(...SECONDARY_COLOR);
  doc.rect(0, 24, doc.internal.pageSize.getWidth(), 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('APNA CAMPUS • DEPARTMENT OF CSE', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text('Master Weekly Academic Class Routine • 5th Semester B.Tech (Section A) • Autumn 2026', 14, 18);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const tableData = [
    ['09:30 - 10:25', 'Artificial Intelligence (CS501)\nRoom 301 · Dr. P. Nayak', 'Cloud Computing (CS503)\nRoom 301 · Prof. M. Das', 'Operating Systems (CS502)\nRoom 301 · Dr. K. Rao', 'Compiler Design (CS504)\nRoom 301 · Prof. S. Jena', 'Machine Learning (CS502)\nRoom 301 · Dr. R. Mishra'],
    ['10:25 - 11:20', 'Operating Systems (CS502)\nRoom 301 · Dr. K. Rao', 'Compiler Design (CS504)\nRoom 301 · Prof. S. Jena', 'Artificial Intelligence (CS501)\nRoom 301 · Dr. P. Nayak', 'Machine Learning (CS502)\nRoom 301 · Dr. R. Mishra', 'Cloud Computing (CS503)\nRoom 301 · Prof. M. Das'],
    ['11:30 - 12:25', 'Machine Learning (CS502)\nRoom 301 · Dr. R. Mishra', 'Artificial Intelligence (CS501)\nRoom 301 · Dr. P. Nayak', 'Compiler Design (CS504)\nRoom 301 · Prof. S. Jena', 'Cloud Computing (CS503)\nRoom 301 · Prof. M. Das', 'Operating Systems (CS502)\nRoom 301 · Dr. K. Rao'],
    ['12:25 - 01:20', 'Compiler Design (CS504)\nRoom 301 · Prof. S. Jena', 'AI Lab (Group 1)\nLab 4 · Dr. P. Nayak', 'Cloud Lab (Group 1)\nLab 2 · Prof. M. Das', 'AI Lab (Group 2)\nLab 4 · Dr. P. Nayak', 'Seminar / Aptitude Prep\nAuditorium · T&P Team'],
    ['01:20 - 02:10', '— LUNCH BREAK —', '— LUNCH BREAK —', '— LUNCH BREAK —', '— LUNCH BREAK —', '— LUNCH BREAK —'],
    ['02:10 - 03:05', 'Cloud Lab (Group 2)\nLab 2 · Prof. M. Das', 'Library / Self Study\nCentral Library', 'Project Phase-1 Mentoring\nProject Lab · Faculty Guides', 'Technical Coding Drill\nLab 5 · Coding Cell', 'Sports / Co-Curricular\nCampus Ground'],
    ['03:05 - 04:00', 'Project Phase-1 Mentoring\nProject Lab · Faculty Guides', 'Research Colloquium\nSeminar Hall', 'Mentorship & Counseling\nFaculty Chambers', 'Club Activities\nSAC Building', 'Open Elective Lecture\nLH-2']
  ];

  renderTable(doc, {
    startY: 32,
    head: [['Time Slot', ...days]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: TEXT_DARK,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' }
    }
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Note: 75% minimum attendance is mandatory as per BPUT autonomous norms.', 14, pageHeight - 8);
  doc.text('Head of Department (CSE) • Apna Campus', pageWidth - 14, pageHeight - 8, { align: 'right' });

  doc.save('Class_Timetable_5th_Sem_CSE.pdf');
}

// -------------------------------------------------------------
// 5. Official University Notice / Circular PDF
// -------------------------------------------------------------
export function downloadNoticePdf(notice = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Office of the Registrar & Autonomous Council', 'University Notification & Official Circular');

  const title = notice.title || 'Official University Academic Notification';
  const tag = (notice.tag || 'Academic').toUpperCase();
  const date = notice.date || new Date().toLocaleDateString('en-IN');
  const publisher = notice.publisher || 'Dean Academics';
  const content = notice.content || notice.summary || 'Official notification details released for student information and institutional compliance.';
  const refNo = `GIFT/AUTO/NOTIF/2026/${Math.floor(100 + Math.random() * 900)}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`REF NO: ${refNo}`, 14, 54);
  doc.text(`DATE OF ISSUE: ${date}`, doc.internal.pageSize.getWidth() - 14, 54, { align: 'right' });

  // Tag chip
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14, 58, 34, 7, 2, 2, 'FD');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(7.5);
  doc.text(`CATEGORY: ${tag}`, 31, 63, { align: 'center' });

  // Notice subject
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...PRIMARY_COLOR);
  const splitTitle = doc.splitTextToSize(`SUBJECT: ${title}`, doc.internal.pageSize.getWidth() - 28);
  doc.text(splitTitle, 14, 73);

  const titleHeight = splitTitle.length * 6;

  // Body content box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 73 + titleHeight, doc.internal.pageSize.getWidth() - 28, 80, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const splitContent = doc.splitTextToSize(content, doc.internal.pageSize.getWidth() - 40);
  doc.text(splitContent, 20, 81 + titleHeight);

  // Dispatch distribution list
  const dispatchY = 165 + titleHeight;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Copy forwarded for information and necessary action to:', 14, dispatchY);

  const copies = [
    '1. All Heads of Academic Departments (CSE, ECE, EEE, MECH, CIVIL)',
    '2. Controller of Examinations & Dean Student Affairs',
    '3. Chief Warden, Campus Boys & Girls Hostels',
    '4. Notice Boards & College ERP Portal Repository'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  copies.forEach((c, idx) => {
    doc.text(c, 18, dispatchY + 6 + (idx * 5));
  });

  // Stamp and signature
  drawOfficialSeal(doc, 14, dispatchY + 30, 'REGISTRAR');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`By Order,`, doc.internal.pageSize.getWidth() - 60, dispatchY + 36);
  doc.text(publisher, doc.internal.pageSize.getWidth() - 60, dispatchY + 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Apna Campus, Bhubaneswar', doc.internal.pageSize.getWidth() - 60, dispatchY + 47);

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Official_Notice_${(notice.attachment || 'Circular').replace(/\s+/g, '_')}`);
}

// -------------------------------------------------------------
// 6. Subject Curriculum Syllabus PDF
// -------------------------------------------------------------
export function downloadSyllabusPdf(subject = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const code = subject.code || 'CS501';
  const name = subject.name || 'Artificial Intelligence';

  addInstitutionalHeader(doc, `Course Syllabus: ${code} - ${name}`, 'Department of Computer Science & Engineering • 4 Credits');

  // Course Overview Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, doc.internal.pageSize.getWidth() - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`SUBJECT CODE: ${code}`, 20, 60);
  doc.text('CREDITS: 4 (L:3, T:1, P:0)', 125, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Title: ${name}`, 20, 67);
  doc.text('Prerequisites: Data Structures & Discrete Mathematics', 125, 67);
  doc.text('Evaluation Scheme: CIA (20 Marks) + End Sem Exam (80 Marks)', 20, 74);
  doc.text('Approved by: BPUT Academic Council', 125, 74);

  const modules = [
    ['Module 1', 'Search Algorithms & Problem Formulation', 'State space search, BFS, DFS, Heuristic search, A*, AO*, Adversarial games, Minimax algorithm with alpha-beta pruning.', '8 Hours'],
    ['Module 2', 'Knowledge Representation & Logic', 'Propositional logic, First-order predicate calculus, Resolution refutation, Forward/backward chaining, Ontologies, Semantic nets.', '10 Hours'],
    ['Module 3', 'Probabilistic Reasoning & Uncertainty', 'Bayesian networks, Conditional probability, Exact inference, Dempster-Shafer theory, Fuzzy reasoning models.', '8 Hours'],
    ['Module 4', 'Machine Learning Foundations', 'Supervised vs unsupervised learning, Decision trees, Support Vector Machines, Neural representations, Reinforcement learning basics.', '10 Hours'],
    ['Module 5', 'Natural Language Processing & Ethics', 'N-gram language models, syntactic parsing, semantic representations, Ethical considerations, Bias in AI systems.', '6 Hours']
  ];

  renderTable(doc, {
    startY: 85,
    head: [['Module', 'Theme', 'Detailed Syllabus Topics', 'Lectures']],
    body: modules,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 95 },
      3: { cellWidth: 22, halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('RECOMMENDED TEXTBOOKS & REFERENCES:', 14, finalY);

  const books = [
    '1. Stuart Russell & Peter Norvig, "Artificial Intelligence: A Modern Approach", Pearson Education, 4th Edition.',
    '2. Elaine Rich, Kevin Knight & Shivashankar B. Nair, "Artificial Intelligence", McGraw Hill, 3rd Edition.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  books.forEach((b, idx) => {
    doc.text(b, 14, finalY + 6 + (idx * 5));
  });

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Syllabus_${code}_${name.replace(/\s+/g, '_')}.pdf`);
}

// -------------------------------------------------------------
// 7. Library Book E-Copy Summary PDF
// -------------------------------------------------------------
export function downloadLibraryBookPdf(book = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Central Library Digital Resource', 'Autonomous E-Learning & Reference Repository');

  const title = book.title || 'Core Computer Science Reference Work';
  const author = book.author || 'Academic Faculty Press';
  const callNo = book.callNo || `QA76.73.${Math.floor(100 + Math.random() * 899)}`;
  const category = book.category || 'Computer Science & Engineering';

  // Book Meta Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 52, doc.internal.pageSize.getWidth() - 28, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Primary Author: ${author}`, 20, 70);
  doc.text(`Discipline: ${category}`, 125, 70);
  doc.text(`Library Call Number: ${callNo}`, 20, 77);
  doc.text('Institutional Access: Licensed for GIFT Students & Faculty', 125, 77);

  // Chapter breakdown table
  const chapters = [
    ['Chapter 1', 'Foundations & Architectural Principles', 'Core theoretical framework, historical context, and fundamental paradigms.'],
    ['Chapter 2', 'Algorithmic Complexity & Design Patterns', 'Big-O notation, asymptotic analysis, divide-and-conquer methodologies.'],
    ['Chapter 3', 'State of the Art Implementation Protocols', 'Applied code examples, production engineering considerations.'],
    ['Chapter 4', 'Advanced Topics & Emerging Research', 'Distributed paradigms, scalability bottlenecks, future directions.'],
    ['Appendix', 'Mathematical Formulations & Notation Reference', 'Proof sketches, symbol tables, benchmark benchmark summaries.']
  ];

  renderTable(doc, {
    startY: 94,
    head: [['Section', 'Chapter Title', 'Abstract & Coverage Summary']],
    body: chapters,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { cellWidth: 92 }
    }
  });

  drawOfficialSeal(doc, 14, doc.lastAutoTable.finalY + 12, 'CENTRAL LIBRARY');
  addInstitutionalFooter(doc, 1, 1);

  doc.save(`Library_ECopy_${title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`);
}

// -------------------------------------------------------------
// 8. Hostel Occupancy Census & Maintenance PDF
// -------------------------------------------------------------
export function downloadHostelCensusPdf(hostels = []) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Hostel Occupancy Census & Resident Register', 'Office of Chief Warden & Campus Housing Administration');

  const defaultHostels = [
    ['Kharavela Boys Residence (Block A)', '250', '238', '12', '95.2%'],
    ['Kapilash Boys Residence (Block B)', '200', '192', '8', '96.0%'],
    ['Mahanadi Girls Residence (Block C)', '220', '215', '5', '97.7%']
  ];

  const bodyData = hostels.length > 0 
    ? hostels.map(h => [h.name, h.capacity, h.occupied, h.capacity - h.occupied, `${((h.occupied / h.capacity) * 100).toFixed(1)}%`])
    : defaultHostels;

  renderTable(doc, {
    startY: 54,
    head: [['Hostel Residence Name', 'Total Capacity (Beds)', 'Occupied Beds', 'Vacant Beds', 'Occupancy %']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center' },
      4: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Census Key Metrics
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, doc.internal.pageSize.getWidth() - 28, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('CAMPUS HOUSING METRICS SUMMARY', 20, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text('• Total Accommodation Capacity: 670 Beds across 3 residential complexes', 20, finalY + 15);
  doc.text('• Total Resident Scholars Registered: 645 Scholars (96.3% Aggregate Occupancy)', 20, finalY + 21);

  drawOfficialSeal(doc, 14, finalY + 36, 'CHIEF WARDEN');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Chief Warden & Student Housing', 135, finalY + 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Apna Campus, Bhubaneswar', 135, finalY + 52);

  addInstitutionalFooter(doc, 1, 1);

  doc.save('Hostel_Occupancy_Census_Report.pdf');
}

// -------------------------------------------------------------
// 9. Accounts Daily Fee Collection Register PDF
// -------------------------------------------------------------
export function downloadAccountsRegisterPdf(transactions = []) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Daily Fee Collection & Revenue Register', 'Office of Accounts & Financial Audit Section');

  const defaultTxns = [
    ['TXN-98421', 'Aarav Sharma', '2301289140', 'Tuition Fee', 'INR 48,500', 'Net Banking'],
    ['TXN-98422', 'Rohan Verma', '2301289142', 'Exam Fee', 'INR 3,500', 'UPI'],
    ['TXN-98423', 'Sneha Patel', '2301289145', 'Hostel Fee', 'INR 32,000', 'Credit Card'],
    ['TXN-98424', 'Rakesh Das', '2301289146', 'Caution Deposit', 'INR 5,000', 'Bank Challan'],
    ['TXN-98425', 'Vikram Singh', '2301289148', 'Tuition Fee', 'INR 48,500', 'UPI']
  ];

  const bodyData = transactions.length > 0
    ? transactions.map(t => [t.id || t.receiptNo, t.studentName || 'Student', t.rollNumber || '2301289000', t.head, `INR ${Number(t.amount).toLocaleString('en-IN')}`, t.mode])
    : defaultTxns;

  renderTable(doc, {
    startY: 54,
    head: [['Txn ID', 'Student Name', 'Roll Number', 'Fee Head', 'Amount', 'Payment Mode']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 28 },
      3: { cellWidth: 38 },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 26, halign: 'center' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  drawOfficialSeal(doc, 14, finalY, 'BURSAR OFFICE');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Senior Finance Officer / Bursar', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Accounts Section • Apna Campus', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);

  doc.save('Daily_Fee_Collection_Register.pdf');
}

// -------------------------------------------------------------
// 9b. Student Financial Account Statement PDF
// -------------------------------------------------------------
export function downloadStudentStatementPdf(statement = {}) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const student = statement.student || {};
  addInstitutionalHeader(doc, 'Student Financial Account Statement', `Registration ID: ${student.rollNumber || 'N/A'}`);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`Student: ${student.studentName || 'Student'}`, 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Program: ${student.program || 'B.Tech (Autonomous)'} | Dept: ${student.department || 'CSE'} | Sem: ${student.semester || 'Semester 5'}`, 14, 51);
  doc.text(`Total Assessed: INR ${(statement.totalAnnualDues || 0).toLocaleString('en-IN')} | Paid: INR ${(statement.paidAmount || 0).toLocaleString('en-IN')} | Balance Due: INR ${(statement.outstanding || 0).toLocaleString('en-IN')}`, 14, 56);

  const feeHeads = statement.feeHeads || [];
  const bodyData = feeHeads.map(fh => [
    fh.head || 'Fee Head',
    `INR ${Number(fh.assessed || 0).toLocaleString('en-IN')}`,
    `INR ${Number(fh.paid || 0).toLocaleString('en-IN')}`,
    `INR ${Number(fh.balance || 0).toLocaleString('en-IN')}`,
    fh.dueDate || '-',
    fh.status || (fh.balance === 0 ? 'Cleared' : 'Pending')
  ]);

  renderTable(doc, {
    startY: 62,
    head: [['Fee Head / Component', 'Assessed (INR)', 'Paid (INR)', 'Balance (INR)', 'Due Date', 'Status']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 54 },
      1: { cellWidth: 26, halign: 'right' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || 130) + 10;
  drawOfficialSeal(doc, 14, finalY, 'BURSAR OFFICE');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Authorized Finance Officer / Bursar', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Accounts & Fee Clearance Section • Apna Campus', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);
  doc.save(`Student_Fee_Statement_${student.rollNumber || 'Record'}.pdf`);
}

// -------------------------------------------------------------
// 9c. Semester Defaulters List PDF
// -------------------------------------------------------------
export function downloadDefaultersListPdf(defaulters = []) {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  addInstitutionalHeader(doc, 'Institutional Fee Defaulters & Arrears Register', 'Office of the Bursar • Semester Clearance Audit');

  const defaultRows = [
    ['2301289146', 'Rakesh Das', 'CSE - Sem 5', 'INR 28,500', '15-Aug-2026', 'Final Notice'],
    ['2301289150', 'Priya Mohanty', 'ECE - Sem 5', 'INR 18,000', '15-Aug-2026', 'Reminder 2'],
    ['2301289154', 'Subrat Nayak', 'MECH - Sem 5', 'INR 34,000', '15-Aug-2026', 'Final Notice'],
    ['2301289162', 'Ananya Sahu', 'CIVIL - Sem 5', 'INR 12,500', '15-Aug-2026', 'Reminder 1']
  ];

  const bodyData = defaulters.length > 0
    ? defaulters.map(d => [d.rollNumber || d.roll, d.name, `${d.department || 'CSE'} - ${d.semester || 'Sem 5'}`, `INR ${Number(d.dueAmount || d.outstanding || 0).toLocaleString('en-IN')}`, d.dueDate || '15-Aug-2026', d.noticeLevel || 'Notice Sent'])
    : defaultRows;

  renderTable(doc, {
    startY: 54,
    head: [['Roll Number', 'Student Name', 'Program & Semester', 'Outstanding (INR)', 'Due Date', 'Clearance Status']],
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 42 },
      2: { cellWidth: 38 },
      3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 24, halign: 'center' }
    }
  });

  const finalY = (doc.lastAutoTable?.finalY || 130) + 10;
  drawOfficialSeal(doc, 14, finalY, 'BURSAR OFFICE');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Senior Finance Officer / Bursar', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Accounts Section • Apna Campus', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);
  doc.save('Fee_Defaulters_Register.pdf');
}


// -------------------------------------------------------------
// 10. Department Continuous Internal Assessment (CIA) Gazette PDF
// -------------------------------------------------------------
export function downloadDepartmentGazettePdf(courseTitle = 'Data Structures (CS501) CIA Gazette') {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, courseTitle, 'Office of Head of Department (CSE) • Continuous Evaluation Return');

  const rows = [
    ['1', '2301289140', 'Aarav Sharma', '18.5', '19.0', '18.0', '19.5', '19.0', 'O'],
    ['2', '2301289141', 'Priya Jena', '17.0', '18.5', '17.5', '18.0', '17.8', 'A+'],
    ['3', '2301289142', 'Rohan Verma', '16.5', '16.0', '15.5', '17.0', '16.3', 'A'],
    ['4', '2301289143', 'Ishita Mohanty', '19.0', '19.5', '18.5', '20.0', '19.3', 'O'],
    ['5', '2301289144', 'Siddharth Sahoo', '15.0', '16.0', '15.0', '15.5', '15.4', 'B+'],
    ['6', '2301289145', 'Sneha Patel', '18.0', '17.5', '18.0', '19.0', '18.1', 'A+'],
    ['7', '2301289146', 'Rakesh Das', '19.5', '20.0', '19.0', '20.0', '19.6', 'O']
  ];

  renderTable(doc, {
    startY: 54,
    head: [['#', 'Roll Number', 'Student Name', 'Quiz (20)', 'Mid-1 (20)', 'Mid-2 (20)', 'Assign (20)', 'Final CIA (20)', 'Grade']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 42 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  drawOfficialSeal(doc, 14, finalY, 'CSE DEPT');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Head of Department (CSE)', 135, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Department of Computer Science & Engineering', 135, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`${courseTitle.replace(/\s+/g, '_')}.pdf`);
}

// -------------------------------------------------------------
// 11. Canteen Daily Sales Statement PDF
// -------------------------------------------------------------
export function downloadCanteenStatementPdf() {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, 'Daily Canteen Sales & Token Register', 'Campus Central Cafeteria • Daily Financial Return');

  const rows = [
    ['1', 'Special South Indian Thali', '48', 'INR 75', 'INR 3,600'],
    ['2', 'Masala Dosa with Sambar', '65', 'INR 50', 'INR 3,250'],
    ['3', 'Chicken Biryani Plate', '84', 'INR 120', 'INR 10,080'],
    ['4', 'Veg Paneer Fried Rice', '52', 'INR 80', 'INR 4,160'],
    ['5', 'Cold Coffee / Milkshakes', '76', 'INR 35', 'INR 2,660'],
    ['6', 'Tea & Fresh Snacks', '140', 'INR 15', 'INR 2,100']
  ];

  renderTable(doc, {
    startY: 54,
    head: [['#', 'Menu Item Name', 'Quantity Dispatched', 'Unit Price', 'Gross Total (INR)']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 36, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, finalY, doc.internal.pageSize.getWidth() - 28, 16, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('TOTAL DAILY GROSS REVENUE:', 20, finalY + 10);
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text('INR ₹25,850', 145, finalY + 11);

  drawOfficialSeal(doc, 14, finalY + 24, 'CANTEEN ADMIN');
  addInstitutionalFooter(doc, 1, 1);

  doc.save('Daily_Canteen_Sales_Statement.pdf');
}

// -------------------------------------------------------------
// 12. Institutional College-wide Performance Report PDF
// -------------------------------------------------------------
export function downloadAdminReportPdf(reportType = 'College-wide Performance Report') {
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addInstitutionalHeader(doc, reportType, 'Office of Principal & Academic Council • Annual Institutional Review');

  const rows = [
    ['Computer Science & Engineering', '480', '96.2%', '8.48', '94.5%'],
    ['Electronics & Communication Eng.', '240', '92.4%', '8.12', '88.0%'],
    ['Electrical & Electronics Eng.', '180', '89.5%', '7.84', '82.5%'],
    ['Mechanical Engineering', '180', '88.0%', '7.76', '80.0%'],
    ['Civil Engineering', '120', '91.2%', '7.92', '83.0%']
  ];

  renderTable(doc, {
    startY: 54,
    head: [['Academic Department', 'Total Enrolled', 'Pass Rate (%)', 'Average CGPA', 'Placement Rate (%)']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK
    },
    columnStyles: {
      0: { cellWidth: 64 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 34, halign: 'center', fontStyle: 'bold' }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  drawOfficialSeal(doc, 14, finalY, 'COLLEGE COUNCIL');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Principal & Director of Academics', 130, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Apna Campus, Bhubaneswar', 130, finalY + 16);

  addInstitutionalFooter(doc, 1, 1);

  doc.save(`${reportType.replace(/\s+/g, '_')}.pdf`);
}

// -------------------------------------------------------------
// 12. Student Uploaded Document PDF Verification Certificate
// -------------------------------------------------------------
export function downloadStudentDocumentPdf(record) {
  const dName = (record.docName || '').toLowerCase();
  const cleanName = (record.docName || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanId = (record.studentId || record.rollNumber || 'std').toLowerCase().replace(/[^a-z0-9]/g, '_');

  // ── BRANCH 1: AADHAAR CARD (UIDAI) ──
  if (dName.includes('aadhaar')) {
    const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Top Tricolor Bar
    doc.setFillColor(255, 153, 51); // Saffron
    doc.rect(14, 16, (pageWidth - 28) / 3, 3, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(14 + (pageWidth - 28) / 3, 16, (pageWidth - 28) / 3, 3, 'F');
    doc.setFillColor(19, 136, 8); // Green
    doc.rect(14 + ((pageWidth - 28) / 3) * 2, 16, (pageWidth - 28) / 3, 3, 'F');

    // Header UIDAI
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('GOVERNMENT OF INDIA / भारत सरकार', pageWidth / 2, 28, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('UNIQUE IDENTIFICATION AUTHORITY OF INDIA / भारतीय विशिष्ट पहचान प्राधिकरण', pageWidth / 2, 34, { align: 'center' });

    doc.setDrawColor(203, 213, 225);
    doc.line(14, 38, pageWidth - 14, 38);

    // Aadhaar Card Box
    const cardX = 20;
    const cardY = 46;
    const cardW = pageWidth - 40;
    const cardH = 100;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD');

    // Photo Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(cardX + 8, cardY + 12, 32, 40, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(record.studentName.charAt(0), cardX + 24, cardY + 34, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('STUDENT PHOTO', cardX + 24, cardY + 48, { align: 'center' });

    // Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`Name: ${record.studentName}`, cardX + 46, cardY + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    doc.text('DOB / जन्म तिथि: 15/03/2005', cardX + 46, cardY + 28);
    doc.text(`Gender / लिंग: ${record.sex === 'Female' ? 'FEMALE / महिला' : 'MALE / पुरुष'}`, cardX + 46, cardY + 36);
    doc.text('Address: Plot 18, Unit 4, Bhubaneswar, Khordha, Odisha - 751001', cardX + 46, cardY + 44);

    // QR & Barcode Simulation
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.rect(cardX + cardW - 32, cardY + 14, 24, 24);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('[UIDAI QR]', cardX + cardW - 20, cardY + 27, { align: 'center' });

    // Aadhaar Number Row
    doc.setFillColor(248, 250, 252);
    doc.rect(cardX, cardY + cardH - 30, cardW, 30, 'F');
    doc.line(cardX, cardY + cardH - 30, cardX + cardW, cardY + cardH - 30);

    doc.setFont('courier', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...PRIMARY_COLOR);
    const lastDigits = String(record.registrationNumber || '2305').slice(-4);
    doc.text(`4821  9081  ${lastDigits}`, cardX + cardW / 2, cardY + cardH - 16, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38);
    doc.text('मेरा आधार, मेरी पहचान (Mera Aadhaar, Meri Pehchan)', cardX + cardW / 2, cardY + cardH - 8, { align: 'center' });

    // Institutional Verification Seal
    drawOfficialSeal(doc, 20, 160, 'UIDAI VERIFIED ERP');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('Verified via Central Campus ERP Database', 75, 168);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`Student: ${record.studentName} | Reg No: ${record.registrationNumber} | Sec: ${record.section}`, 75, 174);

    addInstitutionalFooter(doc, 1, 1);
    doc.save(`${cleanId}_aadhaar_card.pdf`);
    return;
  }

  // ── BRANCH 2: PAN CARD (INCOME TAX DEPT) ──
  if (dName.includes('pan')) {
    const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    addInstitutionalHeader(doc, 'INCOME TAX DEPARTMENT · PAN CARD CREDENTIAL', 'Government of India / भारत सरकार');

    const cardX = 20;
    const cardY = 56;
    const cardW = pageWidth - 40;
    const cardH = 90;

    // Card background
    doc.setFillColor(240, 249, 255);
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(1.2);
    doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'FD');

    // Header band
    doc.setFillColor(2, 132, 199);
    doc.roundedRect(cardX, cardY, cardW, 16, 4, 4, 'F');
    doc.rect(cardX, cardY + 12, cardW, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('INCOME TAX DEPARTMENT / आयकर विभाग', cardX + 10, cardY + 10);
    doc.text('GOVT. OF INDIA / भारत सरकार', cardX + cardW - 10, cardY + 10, { align: 'right' });

    // Photo Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX + 8, cardY + 22, 28, 34, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(record.studentName.charAt(0), cardX + 22, cardY + 41, { align: 'center' });

    // Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Name / नाम:', cardX + 42, cardY + 26);
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DARK);
    doc.text(record.studentName.toUpperCase(), cardX + 42, cardY + 31);

    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Father's Name / पिता का नाम:", cardX + 42, cardY + 38);
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    const fName = record.studentObj?.fatherName?.toUpperCase() || `${record.studentName.split(' ')[1] || 'KUMAR'} SENIOR`;
    doc.text(fName, cardX + 42, cardY + 43);

    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Date of Birth / जन्म तिथि:', cardX + 42, cardY + 50);
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    doc.text('15/03/2005', cardX + 42, cardY + 55);

    // PAN Number
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(cardX + 42, cardY + 62, 70, 14, 2, 2, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(146, 64, 14);
    const panNum = `BPKPD${String(record.rollNumber || '01').padStart(3, '0')}7K`;
    doc.text(panNum, cardX + 77, cardY + 71, { align: 'center' });

    // Footer of Card
    doc.setFillColor(2, 132, 199);
    doc.roundedRect(cardX, cardY + cardH - 10, cardW, 10, 0, 0, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('PERMANENT ACCOUNT NUMBER CARD / स्थायी लेखा संख्या कार्ड', cardX + cardW / 2, cardY + cardH - 4, { align: 'center' });

    drawOfficialSeal(doc, 20, 160, 'INCOME TAX VERIFIED');
    addInstitutionalFooter(doc, 1, 1);
    doc.save(`${cleanId}_pan_card.pdf`);
    return;
  }

  // ── BRANCH 3: NPTEL ONLINE CERTIFICATION (IIT MADRAS / MOE) ──
  if (dName.includes('nptel')) {
    const doc = createPdfDoc({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Ornate Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(2);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.8);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // NPTEL Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138);
    doc.text('NPTEL Online Certification', pageWidth / 2, 32, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('(Funded by the MoE, Government of India)', pageWidth / 2, 38, { align: 'center' });

    doc.setFontSize(11);
    doc.text('This certificate is computer verified and awarded to', pageWidth / 2, 50, { align: 'center' });

    // Recipient Name
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(15, 43, 72);
    doc.text(record.studentName, pageWidth / 2, 63, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('for successfully completing the 12-week online course', pageWidth / 2, 73, { align: 'center' });

    // Course Title
    const courseTitle = record.docName.replace(/NPTEL Certificate\s*\(/i, '').replace(/\)/, '') || 'Cloud Computing and Distributed Systems';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(courseTitle, pageWidth / 2, 83, { align: 'center' });

    // Score Table
    renderTable(doc, {
      startY: 92,
      margin: { left: 45, right: 45 },
      head: [['Online Assignments Score', 'Proctored Exam Score', 'Consolidated Score', 'Certification Status']],
      body: [['24.25 / 25', '63.75 / 75', '88%', 'Elite + Silver Medal']],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontStyle: 'bold', halign: 'center', fontSize: 10 }
    });

    // Signatures
    const signY = 145;
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Prof. Andrew Thangaraj', 45, signY);
    doc.text('Prof. V. Jagadeesh Kumar', pageWidth - 45, signY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('NPTEL Coordinator, IIT Madras', 45, signY + 6);
    doc.text('Dean, Continuing Education, IIT Madras', pageWidth - 45, signY + 6, { align: 'right' });

    // QR Verification
    doc.rect(pageWidth / 2 - 14, signY - 10, 28, 20);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 58, 138);
    doc.text('[IITM QR]', pageWidth / 2, signY - 1, { align: 'center' });
    doc.text(`NPTEL24CS${String(record.registrationNumber || '2305').slice(-6)}`, pageWidth / 2, signY + 5, { align: 'center' });

    doc.save(`${cleanId}_nptel_certificate.pdf`);
    return;
  }

  // ── BRANCH 4 & 5: CLASS 10 & 12 BOARD CERTIFICATES ──
  if (dName.includes('10') || dName.includes('12')) {
    const is10 = dName.includes('10');
    const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Ornate Double Border
    const borderCol = is10 ? [180, 83, 9] : [30, 64, 175];
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(2);
    doc.rect(14, 14, pageWidth - 28, 269);
    doc.setLineWidth(0.6);
    doc.rect(17, 17, pageWidth - 34, 263);

    // Authority Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...borderCol);
    doc.text(
      is10 ? 'BOARD OF SECONDARY EDUCATION, ODISHA / CBSE' : 'COUNCIL OF HIGHER SECONDARY EDUCATION, ODISHA',
      pageWidth / 2,
      28,
      { align: 'center' }
    );

    doc.setFontSize(16);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(
      is10 ? 'HIGH SCHOOL CERTIFICATE EXAMINATION' : 'HIGHER SECONDARY EXAMINATION CERTIFICATE',
      pageWidth / 2,
      38,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      is10 ? 'Annual Secondary School Passing Certificate' : 'Annual Higher Secondary Science Examination',
      pageWidth / 2,
      44,
      { align: 'center' }
    );

    // Certification Statement
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_DARK);
    const stmt = `This is to certify that ${record.studentName}, Roll No: ${is10 ? '21-104-' : '23-SC-'}${String(record.rollNumber || '01').padStart(4, '0')}, Registration No: ${record.registrationNumber}, has passed the examination and secured:`;
    doc.text(stmt, pageWidth / 2, 58, { align: 'center', maxWidth: pageWidth - 50 });

    // Division Banner
    doc.setFillColor(is10 ? 254 : 239, is10 ? 243 : 246, is10 ? 199 : 255);
    doc.roundedRect(pageWidth / 2 - 50, 70, 100, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...borderCol);
    doc.text(is10 ? 'FIRST DIVISION (82.00%)' : 'FIRST DIVISION (86.00%)', pageWidth / 2, 78, { align: 'center' });

    // Subject Breakdown Table
    const rows = is10
      ? [
          ['First Language (Odia / Hindi)', '100', '84', 'A1'],
          ['Second Language (English)', '100', '82', 'A1'],
          ['Mathematics', '100', '88', 'A1'],
          ['General Science', '100', '80', 'A2'],
          ['Social Science', '100', '76', 'B1']
        ]
      : [
          ['Physics', '100', '86 (Theory 58 + Practical 28)', 'A1'],
          ['Chemistry', '100', '84 (Theory 56 + Practical 28)', 'A1'],
          ['Mathematics', '100', '92', 'A1'],
          ['English', '100', '82', 'A1'],
          ['Computer Science', '100', '88 (Theory 60 + Practical 28)', 'A1']
        ];

    renderTable(doc, {
      startY: 90,
      margin: { left: 25, right: 25 },
      head: [['Subject Name', 'Maximum Marks', 'Marks Obtained', 'Grade']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: borderCol, textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    // Seal and Signatures
    const signY = 220;
    drawOfficialSeal(doc, 25, signY, is10 ? 'BSE OFFICIAL' : 'CHSE OFFICIAL');

    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text('Controller of Examinations', pageWidth - 25, signY + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Authenticated Copy · BPUT ERP Gateway', pageWidth - 25, signY + 12, { align: 'right' });

    addInstitutionalFooter(doc, 1, 1);
    doc.save(`${cleanId}_${is10 ? 'class_10' : 'class_12'}_certificate.pdf`);
    return;
  }

  // ── BRANCH 6: STANDARD VERIFIED ACADEMIC DOCUMENT ──
  const doc = createPdfDoc({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  addInstitutionalHeader(doc, 'VERIFIED STUDENT DOCUMENT RECORD', `Document: ${record.docName} | ERP Archive`);

  // Document Badge Header
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 52, pageWidth - 28, 22, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 52, pageWidth - 28, 22, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(record.docName.toUpperCase(), 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Category: ${record.category || 'Academic'} | Format: ${record.fileType || 'PDF'} | Status: VERIFIED & AUTHENTICATED`, 20, 69);

  // Student Particulars Table
  const particulars = [
    ['Student Full Name', record.studentName || 'Student', 'Student ID', record.studentId || 'GIFT-2023-XXXX'],
    ['Registration Number', record.registrationNumber || '230520XXXX', 'Roll Number', record.rollNumber || '01'],
    ['Gender / Sex', record.sex || record.gender || 'Male', 'Department', record.department || 'Computer Science & Engineering'],
    ['Current Semester', record.semester || 'Semester 5', 'Section', record.section || 'Section A'],
    ['Document Type', record.docName, 'Upload Date', record.uploadedAt || '15 Aug 2023'],
    ['Verification Status', 'AUTHENTICATED BY GIFT ERP', 'Archived File Size', record.fileSize || '1.2 MB']
  ];

  renderTable(doc, {
    startY: 80,
    head: [['Field', 'Student Record Details', 'Field', 'Academic Registry Info']],
    body: particulars,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TEXT_DARK,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 50 },
      2: { cellWidth: 42, fontStyle: 'bold', textColor: [71, 85, 105] },
      3: { cellWidth: 48 }
    }
  });

  const nextY = (doc.lastAutoTable?.finalY || 150) + 10;

  // Document Content / Authenticity Notice Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, nextY, pageWidth - 28, 48, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, nextY, pageWidth - 28, 48, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('OFFICIAL VERIFICATION STATEMENT & DIGITAL COMPLIANCE', 20, nextY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  const noticeLines = [
    `1. This document (${record.docName}) was submitted by ${record.studentName} (${record.studentId}) via the student portal.`,
    `2. Verified by Department Faculty, Head of Department (HOD), Accounts, and Campus Academic Administration.`,
    `3. Validated for autonomous academic compliance, semester registration, scholarship auditing, and hostel admission.`,
    `4. Digital Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  ];
  noticeLines.forEach((line, idx) => {
    doc.text(line, 20, nextY + 16 + (idx * 6.5));
  });

  const stampY = nextY + 56;
  drawOfficialSeal(doc, 20, stampY, 'ERP ARCHIVE VERIFIED');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('Academic Registrar & Controller', 125, stampY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Apna Campus, Bhubaneswar', 125, stampY + 15);
  doc.text('Authenticated Electronic Document Archive', 125, stampY + 19);

  addInstitutionalFooter(doc, 1, 1);
  doc.save(`${cleanId}_${cleanName}.pdf`);
}


// -------------------------------------------------------------
// 13. Student Documents Registry Table Export PDF
// -------------------------------------------------------------
export function downloadStudentDocumentsRegisterPdf(records = [], filterInfo = {}) {
  const doc = createPdfDoc({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const filterSummary = `Section: ${filterInfo.section || 'All'} | Semester: ${filterInfo.semester || 'All'} | Sex: ${filterInfo.gender || 'All'} | Count: ${records.length}`;
  addInstitutionalHeader(doc, 'STUDENT UPLOADED DOCUMENTS REGISTRY', filterSummary);

  const tableRows = records.map((r, i) => [
    i + 1,
    r.studentId,
    r.studentName,
    r.sex || r.gender,
    r.section,
    r.semester,
    r.docName,
    r.fileType || 'PDF',
    r.uploadedAt || '—'
  ]);

  renderTable(doc, {
    startY: 52,
    head: [['SL No', 'Student ID', 'Student Name', 'Sex', 'Section', 'Semester', 'Document Name', 'Format', 'Uploaded Date']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
      cellPadding: 2.2
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 26, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 55 },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 26, halign: 'center' }
    }
  });

  addInstitutionalFooter(doc, 1, 1);
  doc.save('GIFT_Student_Documents_Registry.pdf');
}

