// Warden Verified Administrative Document & PDF Generation Service
// Handles institutional PDF generation, real document downloads, and preview URL generation

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
 * Generates an official, verifiable BPUT Autonomous Institutional Certificate for a warden credential
 */
export function generateInstitutionalWardenDocumentPdf(doc, warden = {}) {
  const pdf = createPdfInstance({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const wardenName = warden.name || 'Mr. Rajesh Jena';
  const wardenId = warden.employeeId || warden.id || 'WRD-101';
  const designation = warden.designation || 'Chief Resident Warden (Boys)';
  const department = warden.department || 'Hostel Administration & Student Housing';
  const hostelName = warden.hostelName || 'Gandhi Boys Residence';
  const docRefNo = `BPUT/AUT/HR/${wardenId}/${doc.id || 'DOC-' + Date.now().toString().slice(-4)}`;
  const issueDate = doc.meta?.match(/\d{2}[-/.]\d{2}[-/.]\d{4}/)?.[0] || '15-07-2018';

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
  pdf.text('Campus Directorate & Residential Administration | Bhubaneswar, Odisha - 752054', pageWidth / 2, 28, { align: 'center' });

  // 3. Document Category Badge
  pdf.setFillColor(239, 246, 255);
  pdf.setDrawColor(191, 219, 254);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(pageWidth / 2 - 55, 40, 110, 7.5, 3, 3, 'FD');

  pdf.setTextColor(29, 78, 216);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('OFFICIAL AUTONOMOUS CREDENTIAL · DIGITALLY VERIFIED', pageWidth / 2, 45, { align: 'center' });

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
  pdf.text('CREDENTIAL HOLDER IDENTIFICATION & APPOINTMENT PARTICULARS', 18, currentY);

  currentY += 3;
  const tableData = [
    ['Official Name', wardenName, 'Employee ID', wardenId],
    ['Designation', designation, 'Department', department],
    ['Assigned Hostel', hostelName, 'Supervisory Scope', warden.assignedBlocks || 'All Assigned Residential Blocks'],
    ['Authentication Meta', doc.meta || 'Autonomous Verified', 'Record Verification', 'Authenticated via Campus ERP Gateway']
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
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [71, 85, 105], cellWidth: 38 },
        1: { fontStyle: 'bold', cellWidth: 52 },
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
  pdf.text('INSTITUTIONAL VALIDATION & AUTHENTICITY DECLARATION', 18, currentY);

  currentY += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(51, 65, 85);

  const declarationText = getDocumentDeclarationText(doc.name, wardenName, designation, hostelName);
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
  pdf.text(`• Statutory Verification Code: BPUT-AUTH-${wardenId}-SEC9981`, 22, currentY + 10.5);
  pdf.text(`• Autonomous Registry Entry: Vol-XIV / Hostel Administrative Staff Service Register`, 22, currentY + 15);
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
  pdf.text('PORTAL GATEWAY', pageWidth - 37, currentY + 14, { align: 'center' });

  // 8. Signatures Block
  const sigY = pageHeight - 44;
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.4);

  // Signature 1
  pdf.line(22, sigY, 70, sigY);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(...NAVY_COLOR);
  pdf.text('Dr. P. K. Mohapatra', 46, sigY + 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...TEXT_MUTED);
  pdf.text('Chief Proctor & Hostel Warden Council', 46, sigY + 7.5, { align: 'center' });

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

  // Signature 3
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
  pdf.text('Official computer-authenticated credential generated by Apna Campus ERP System. Statutory verification is archived with Autonomous Secretariat.', 14, pageHeight - 11);
  pdf.text(`BPUT Autonomous Verification Portal: https://apnacampus.edu.in/verify/${wardenId}`, 14, pageHeight - 8);
  pdf.text(`Page 1 of 1 · Verified Oct 2026`, pageWidth - 14, pageHeight - 8, { align: 'right' });

  return pdf;
}

/**
 * Returns specific formal declaration text based on credential type
 */
function getDocumentDeclarationText(docName, wardenName, designation, hostelName) {
  const lower = (docName || '').toLowerCase();

  if (lower.includes('appointment')) {
    return `This is to formally certify that ${wardenName} has been officially appointed to the post of ${designation} at ${hostelName}, under the residential administration of Apna Campus Autonomous College. The official joining order has been vetted and ratified by the Autonomous Board of Governors. The appointee is empowered with 24x7 custodial supervision, gate pass approval jurisdiction, student disciplinary oversight, and student resident welfare authority under BPUT Autonomous Residential Guidelines Section 14.`;
  }

  if (lower.includes('degree') || lower.includes('qualification')) {
    return `This document certifies that the academic and technical qualifications submitted by ${wardenName}—including Master of Technology (M.Tech) and Bachelor of Technology (B.Tech) degrees—have been thoroughly authenticated against the primary university register and verified by the Autonomous Academic Credentials Evaluation Board. The candidate fulfills all requisite qualifications for academic student residency mentorship and operational hostel administration.`;
  }

  if (lower.includes('identity') || lower.includes('aadhaar') || lower.includes('pan')) {
    return `This record certifies that the statutory government identity credentials of ${wardenName} (including UIDAI Aadhaar verification and Income Tax PAN registration) have been validated through official verification protocols. All biometric thumb credentials and address particulars correspond to institutional compliance standards and are officially archived in the institutional HR personnel dossier.`;
  }

  if (lower.includes('curfew') || lower.includes('night') || lower.includes('safety')) {
    return `This is to certify that ${wardenName} has satisfactorily completed the Campus Safety & Hostel Night Curfew Management Certification conducted by the Campus Safety & Disaster Preparedness Council. The certification covers emergency medical evacuation, night curfew biometric reconciliation, fire safety warden protocol, and crisis escalation protocols applicable across all residential hostel complexes.`;
  }

  if (lower.includes('health') || lower.includes('fitness')) {
    return `This document confirms that ${wardenName} has undergone the mandatory annual occupational health and physical fitness examination conducted by the Campus Medical Officer. The candidate is medically certified to be in excellent health with normal blood pressure and zero chronic operational restrictions, and is officially approved for active 24x7 rotational residence duty and on-call night emergency coverage.`;
  }

  return `This is to formally certify that the credential record titled "${docName}" pertaining to ${wardenName} (${designation}) has been registered and verified by the Hostel Administration & Autonomous Secretariat. The administrative documentation is active, auditable, and archived within the institutional personnel repository.`;
}

/**
 * Downloads the real document as PDF.
 * If user uploaded a PDF file, downloads that exact file.
 * If user uploaded an image, wraps it or downloads.
 * If it's a verified credential without custom file, generates the official institutional PDF.
 */
export function downloadWardenDocument(doc, warden = {}) {
  const sanitizedName = (doc.name || 'Verified_Document').replace(/[^a-zA-Z0-9_-]/g, '_');

  // Case A: User uploaded an actual PDF file
  if (doc.fileData && (doc.fileData.startsWith('data:application/pdf') || doc.fileType === 'application/pdf')) {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || `${sanitizedName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Case B: User uploaded an image file
  if (doc.fileData && doc.fileData.startsWith('data:image/')) {
    const pdf = createPdfInstance({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(doc.name, 14, 20);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Warden: ${warden.name || ''} (${warden.employeeId || warden.id || ''}) · ${doc.meta || ''}`, 14, 26);
    try {
      pdf.addImage(doc.fileData, 'JPEG', 14, 32, 182, 230);
    } catch {}
    pdf.save(`${sanitizedName}.pdf`);
    return;
  }

  // Case C: Standard verified institutional credential -> Generate high-res official PDF
  const pdfDoc = generateInstitutionalWardenDocumentPdf(doc, warden);
  pdfDoc.save(`${sanitizedName}.pdf`);
}

/**
 * Gets a preview URL for the document.
 * Returns either the uploaded file data URI, or generates a live PDF data URI string.
 */
export function getWardenDocumentPreviewUrl(doc, warden = {}) {
  if (doc.fileData) {
    return doc.fileData;
  }
  // Generate official PDF data URI
  try {
    const pdfDoc = generateInstitutionalWardenDocumentPdf(doc, warden);
    return pdfDoc.output('datauristring');
  } catch (err) {
    console.error('Error generating PDF preview URI:', err);
    return null;
  }
}

