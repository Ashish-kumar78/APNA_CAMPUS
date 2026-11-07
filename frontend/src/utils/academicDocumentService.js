// Academic Verified Administrative Document & PDF Generation Service
// Handles institutional PDF generation, academic credentials, and preview URL generation

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Institutional branding colors
const NAVY_COLOR = [15, 23, 42];     // Deep Slate/Navy
const BLUE_ACCENT = [2, 132, 199];   // Sky Blue
const GOLD_COLOR = [217, 119, 6];    // Warm Amber / Gold
const TEXT_MUTED = [100, 116, 139];  // Slate 500

/**
 * Safely creates a jsPDF instance across CJS/ESM contexts
 */
function createPdfInstance(options = { orientation: 'portrait', unit: 'mm', format: 'a4' }) {
  const Constructor = typeof jsPDF === 'function'
    ? jsPDF
    : (jsPDF?.jsPDF || (typeof window !== 'undefined' && window.jspdf?.jsPDF) || jsPDF?.default);
  return new Constructor(options);
}

/**
 * Returns specific formal declaration text based on academic credential type
 */
function getAcademicDocumentDeclarationText(docName, personName, designation, department) {
  const lower = (docName || '').toLowerCase();

  if (lower.includes('appointment')) {
    return `This is to formally certify that ${personName} has been officially appointed to the autonomous faculty position of ${designation} in the Department of ${department}, Apna Campus Autonomous College. The official appointment and ratification order has been duly vetted and ratified by the Autonomous Board of Governors and Academic Council. The appointee is empowered with instructional delivery, continuous internal assessment evaluation, examination oversight, and academic mentorship jurisdiction under BPUT Autonomous Academic Statutes.`;
  }

  if (lower.includes('degree') || lower.includes('ph.d') || lower.includes('doctoral') || lower.includes('transcripts')) {
    return `This document certifies that the academic qualifications, doctoral dissertations, and technical degrees submitted by ${personName}—including Ph.D., Master of Technology, and Bachelor of Engineering/Technology transcripts—have been authenticated against primary university registries and validated by the Autonomous Academic Credentials Evaluation Board. The candidate fulfills all requisite UGC, AICTE, and University qualifications for high-impact teaching and academic research.`;
  }

  if (lower.includes('identity') || lower.includes('aadhaar') || lower.includes('pan')) {
    return `This record certifies that the statutory government identity credentials of ${personName} (including UIDAI Aadhaar verification and Income Tax PAN registration) have been validated through official verification protocols. All biometric credentials and institutional address records correspond to institutional compliance standards and are officially archived in the institutional HR personnel dossier.`;
  }

  if (lower.includes('project') || lower.includes('dst') || lower.includes('aicte')) {
    return `This document certifies that the sponsored research grant and funded R&D project entitled to ${personName} as Principal Investigator has received full institutional statutory sanction and compliance clearance. Financial allocations and milestone audits are maintained under the Autonomous Sponsored Research and Industrial Consultancy (SRIC) Cell.`;
  }

  return `This is to officially certify that ${personName} is an active, verified member of Apna Campus Autonomous College holding the designation of ${designation} in the Department of ${department}. The credential document titled "${docName}" has been submitted, verified against institutional records, and recorded in the autonomous university registry.`;
}

/**
 * Generates an official, verifiable BPUT Autonomous Institutional Certificate for an academic credential
 */
export function generateInstitutionalAcademicDocumentPdf(doc, profile = {}) {
  const pdf = createPdfInstance({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const personName = profile.name || 'Dr. S. Mohanty';
  const employeeId = profile.employeeId || 'FAC-042';
  const designation = profile.designation || 'Assistant Professor';
  const department = profile.department || 'Computer Science & Engineering';
  const docRefNo = `BPUT/AUT/ACAD/${employeeId}/${doc.id || 'DOC-' + Date.now().toString().slice(-4)}`;
  const issueDate = doc.meta?.match(/\d{2}[-/.]\d{2}[-/.]\d{4}/)?.[0] || '10-07-2019';

  // 1. Double Border Frame
  pdf.setDrawColor(...NAVY_COLOR);
  pdf.setLineWidth(1);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  pdf.setDrawColor(...BLUE_ACCENT);
  pdf.setLineWidth(0.3);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // 2. Top Header Banner
  pdf.setFillColor(...NAVY_COLOR);
  pdf.rect(10, 10, pageWidth - 20, 24, 'F');
  pdf.setFillColor(...GOLD_COLOR);
  pdf.rect(10, 34, pageWidth - 20, 1.8, 'F');

  // Institution Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text('APNA CAMPUS ENTERPRISE AUTONOMOUS INSTITUTION', pageWidth / 2, 18, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text('Affiliated to BPUT Odisha | Approved by AICTE New Delhi | NAAC A++ Autonomous Secretariat', pageWidth / 2, 23, { align: 'center' });
  pdf.text('Academic Council Directorate & Faculty Affairs | Bhubaneswar, Odisha - 752054', pageWidth / 2, 28, { align: 'center' });

  // 3. Document Category Badge
  pdf.setFillColor(239, 246, 255);
  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(pageWidth / 2 - 58, 40, 116, 7.5, 3, 3, 'FD');

  pdf.setTextColor(29, 78, 216);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('OFFICIAL ACADEMIC CREDENTIAL · DIGITALLY VERIFIED', pageWidth / 2, 45, { align: 'center' });

  // 4. Main Title
  pdf.setTextColor(...NAVY_COLOR);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  const titleLines = pdf.splitTextToSize(doc.name.toUpperCase(), pageWidth - 40);
  pdf.text(titleLines, pageWidth / 2, 54, { align: 'center' });

  // Reference and Issue Info
  let currentY = 56 + (titleLines.length * 5);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text(`Document Ref: ${docRefNo}   |   Issued: ${issueDate}   |   Status: Active & Valid`, pageWidth / 2, currentY, { align: 'center' });

  currentY += 4;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(18, currentY, pageWidth - 18, currentY);

  // 5. Credential Holder Profile Table
  currentY += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...NAVY_COLOR);
  pdf.text('CREDENTIAL HOLDER IDENTIFICATION & ACADEMIC DOSSIER', 18, currentY);

  currentY += 3;
  const tableData = [
    ['Faculty / Official Name', personName, 'Employee ID', employeeId],
    ['Designation', designation, 'Department', department],
    ['Category', profile.category || 'Teaching', 'Specialization', profile.specialization || 'Academic Excellence'],
    ['Authentication Meta', doc.meta || 'Autonomous Verified', 'Record Verification', 'Authenticated via Apna Campus ERP']
  ];

  const runner = typeof autoTable === 'function' ? autoTable : (autoTable?.default || pdf.autoTable);
  if (typeof runner === 'function') {
    runner(pdf, {
      startY: currentY,
      margin: { left: 18, right: 18 },
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [71, 85, 105], cellWidth: 42 },
        1: { fontStyle: 'bold', cellWidth: 48 },
        2: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [71, 85, 105], cellWidth: 38 },
        3: { cellWidth: 46 }
      }
    });
    currentY = pdf.lastAutoTable.finalY + 8;
  } else {
    currentY += 30;
  }

  // 6. Detailed Certification Clause
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...NAVY_COLOR);
  pdf.text('INSTITUTIONAL VALIDATION & STATUTORY AUTHENTICITY DECLARATION', 18, currentY);

  currentY += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(51, 65, 85);

  const declarationText = getAcademicDocumentDeclarationText(doc.name, personName, designation, department);
  const splitDeclaration = pdf.splitTextToSize(declarationText, pageWidth - 36);
  pdf.text(splitDeclaration, 18, currentY);

  currentY += (splitDeclaration.length * 4.4) + 6;

  // 7. Verification Attributes Box
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(18, currentY, pageWidth - 36, 24, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text('DIGITAL COMPLIANCE METRICS:', 22, currentY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text(`• Statutory Academic Registry Code: BPUT-ACAD-${employeeId}-SEC8841`, 22, currentY + 10.5);
  pdf.text(`• Autonomous Registry Entry: Vol-XXI / Faculty & Academic Affairs Register`, 22, currentY + 15);
  pdf.text(`• Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Digitally Signed via Apna Campus ERP`, 22, currentY + 19.5);

  // QR Code Placeholder Box
  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(255, 255, 255);
  pdf.rect(pageWidth - 46, currentY + 3, 18, 18, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.setTextColor(...BLUE_ACCENT);
  pdf.text('SCAN TO VERIFY', pageWidth - 37, currentY + 11, { align: 'center' });
  pdf.setFontSize(4.5);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text('ACADEMIC PORTAL', pageWidth - 37, currentY + 14, { align: 'center' });

  // 8. Signatures Block
  const sigY = pageHeight - 44;
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.4);

  // Signature 1: Dean Academics
  pdf.line(22, sigY, 70, sigY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...NAVY_COLOR);
  pdf.text('Prof. (Dr.) M. K. Sahoo', 46, sigY + 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text('Dean of Academic Affairs & Faculty Vetting', 46, sigY + 7.5, { align: 'center' });

  // Signature 2: Autonomous Seal Stamp
  pdf.setDrawColor(...GOLD_COLOR);
  pdf.setLineWidth(0.8);
  pdf.circle(pageWidth / 2, sigY - 2, 10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.setTextColor(...GOLD_COLOR);
  pdf.text('AUTONOMOUS', pageWidth / 2, sigY - 4, { align: 'center' });
  pdf.text('SEAL OF APPROVAL', pageWidth / 2, sigY - 1, { align: 'center' });
  pdf.text('★ BPUT ODISHA ★', pageWidth / 2, sigY + 2, { align: 'center' });

  // Signature 3: Registrar
  pdf.line(pageWidth - 70, sigY, pageWidth - 22, sigY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...NAVY_COLOR);
  pdf.text('Prof. (Dr.) S. K. Rout', pageWidth - 46, sigY + 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text('Registrar & Academic Council Directorate', pageWidth - 46, sigY + 7.5, { align: 'center' });

  // 9. Institutional Footer
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.4);
  pdf.line(10, pageHeight - 16, pageWidth - 10, pageHeight - 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.8);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text('Official computer-authenticated academic credential generated by Apna Campus ERP System. Archived in Autonomous Academic Secretariat.', 14, pageHeight - 11);
  pdf.text(`BPUT Autonomous Verification Portal: https://apnacampus.edu.in/verify/${employeeId}`, 14, pageHeight - 8);
  pdf.text(`Page 1 of 1 · Verified Nov 2026`, pageWidth - 14, pageHeight - 8, { align: 'right' });

  return pdf;
}

/**
 * Downloads the official PDF directly to user's device
 */
export function downloadAcademicDocument(doc, profile = {}) {
  const pdf = generateInstitutionalAcademicDocumentPdf(doc, profile);
  const cleanName = (doc.name || 'Academic_Credential').replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanName}_Verified_Autonomous.pdf`);
}

/**
 * Generates an in-browser preview Data URL or Object URL for the document viewer
 */
export function getAcademicDocumentPreviewUrl(doc, profile = {}) {
  if (doc.fileData) {
    return doc.fileData;
  }
  const pdf = generateInstitutionalAcademicDocumentPdf(doc, profile);
  return pdf.output('bloburl');
}

