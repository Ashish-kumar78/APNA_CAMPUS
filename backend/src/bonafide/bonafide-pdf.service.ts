import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
const PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';

@Injectable()
export class BonafidePdfService {
  private readonly logger = new Logger(BonafidePdfService.name);

  /**
   * Main Dispatcher: Generate PDF based on Purpose
   */
  async generateCertificatePdf(
    application: any,
    certificate: any,
    res: Response,
    isDraftPreview = false,
  ) {
    const doc = new PDFDocument({
      size: 'A4', // 595.28 x 841.89 points
      margins: { top: 36, bottom: 36, left: 42, right: 42 },
      info: {
        Title: `${certificate?.certificateTitle || 'Bonafide Certificate'} - ${application.studentName}`,
        Author: 'GIFT Autonomous, Bhubaneswar',
        Subject: `Official Certificate for ${application.studentName} (${application.studentRoll})`,
      },
    });

    const filename = `Bonafide_${application.studentRoll}_${(certificate?.certificateNumber || application.applicationNumber).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isDraftPreview ? 'inline' : 'attachment'}; filename="${filename}"`,
    );

    doc.pipe(res);

    // Generate Verification QR Code
    let qrBuffer: Buffer | null = null;
    const verifyToken = certificate?.verificationToken || application.id;
    try {
      const qrDataUrl = await QRCode.toDataURL(
        `http://localhost:5173/?verify=bonafide_${verifyToken}`,
        { margin: 1, width: 140, color: { dark: '#0f2b48', light: '#ffffff' } },
      );
      const base64Data = qrDataUrl.split(',')[1];
      qrBuffer = Buffer.from(base64Data, 'base64');
    } catch (e: any) {
      this.logger.warn(`Could not generate QR code buffer: ${e.message}`);
    }

    // Render Draft Watermark if preview
    if (isDraftPreview) {
      this.renderDraftWatermark(doc);
    }

    // Render Header & Letterhead
    this.renderLetterhead(doc);

    // Render Certificate Content by Purpose
    const purpose = application.purpose;
    if (purpose === 'INTERNSHIP') {
      this.renderInternshipContent(doc, application, certificate, qrBuffer);
    } else if (purpose === 'SCHOLARSHIP_HOSTELLER') {
      this.renderScholarshipHostellerContent(doc, application, certificate, qrBuffer);
    } else if (purpose === 'STUDY_LOAN') {
      this.renderStudyLoanContent(doc, application, certificate, qrBuffer);
    } else if (purpose === 'EXTERNAL_EVENT') {
      this.renderExternalEventContent(doc, application, certificate, qrBuffer);
    } else {
      this.renderGenericContent(doc, application, certificate, qrBuffer);
    }

    doc.end();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. LETTERHEAD & INSTITUTION HEADER
  // ─────────────────────────────────────────────────────────────────────────────
  private renderLetterhead(doc: any) {
    const pageWidth = doc.page.width;

    // Top decorative bar: Deep Navy (#0f2b48) with Cyan accent
    doc.rect(0, 0, pageWidth, 6).fill('#0f2b48');
    doc.rect(0, 6, pageWidth, 2).fill('#2563eb');

    // College Cogwheel Emblem Vector
    const emblemX = 42;
    const emblemY = 22;
    doc.circle(emblemX + 22, emblemY + 22, 22).fill('#0f2b48');
    doc.circle(emblemX + 22, emblemY + 22, 20).fill('#ffffff');
    doc.circle(emblemX + 22, emblemY + 22, 18).fill('#0284c7');
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('GIFT', emblemX + 7, emblemY + 15, { width: 30, align: 'center' });

    // College Typography
    const textX = 94;
    doc.fillColor('#0f2b48').font('Helvetica-Bold').fontSize(15).text('GANDHI INSTITUTE FOR TECHNOLOGY', textX, 20);
    doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(11).text('GIFT (AUTONOMOUS), BHUBANESWAR', textX, 37);
    
    doc.fillColor('#475569').font('Helvetica').fontSize(7.5).text(
      'Affiliated to BPUT, Odisha · Approved by AICTE, New Delhi · Accredited NAAC with Grade "A++"',
      textX,
      50,
    );
    doc.fillColor('#64748b').fontSize(7).text(
      'At: Gramadiha, P.O.: Gangapada, Dist: Khurda, Bhubaneswar, Odisha - 752054 · Web: https://gift.edu.in',
      textX,
      60,
    );

    // Decorative separator rule
    doc.moveTo(42, 74).lineTo(pageWidth - 42, 74).lineWidth(1.2).stroke('#0f2b48');
    doc.moveTo(42, 77).lineTo(pageWidth - 42, 77).lineWidth(0.5).stroke('#94a3b8');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TEMPLATE A: INTERNSHIP BONAFIDE CERTIFICATE
  // ─────────────────────────────────────────────────────────────────────────────
  private renderInternshipContent(doc: any, app: any, cert: any, qrBuffer: Buffer | null) {
    const pageWidth = doc.page.width;
    const fData = app.formData || {};
    const refNo = cert?.certificateNumber || `GIFT/T&P/BONAFIDE/2026/${app.applicationNumber.replace(/[^0-9]/g, '').slice(-4)}`;
    const issueDate = cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    // Ref No and Date Row
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text(`Ref. No.: ${refNo}`, 42, 90);
    doc.text(`Date: ${issueDate}`, pageWidth - 160, 90, { width: 118, align: 'right' });

    // Certificate Title Box
    doc.rect(42, 114, pageWidth - 84, 28).fill('#f1f5f9');
    doc.rect(42, 114, pageWidth - 84, 28).lineWidth(0.75).stroke('#cbd5e1');
    doc.fillColor('#0f2b48').font('Helvetica-Bold').fontSize(12).text(
      'BONAFIDE CERTIFICATE FOR INTERNSHIP / SIP',
      42,
      122,
      { width: pageWidth - 84, align: 'center' },
    );

    // Main Certificate Body
    const startY = 162;
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b').lineGap(6);

    const studentName = (app.studentName || 'Student').toUpperCase();
    const studentRoll = app.studentRoll;
    const parentName = fData.parentName || 'Parent / Guardian';
    const course = fData.course || 'B.Tech';
    const dept = fData.department || 'Computer Science & Engineering';
    const sem = fData.semester || 'Semester 5';
    const academicYear = app.academicYear || '2026-27';
    const company = fData.company || 'Central Tool Room and Training Center (CTTC)';
    const role = fData.role || 'Industrial Trainee / Intern';
    const startDate = fData.startDate || '01-12-2026';
    const endDate = fData.endDate || '31-01-2027';
    const mode = fData.mode || 'Hybrid / On-site';

    const p1 = `This is to certify that ${studentName}, bearing Registration / Roll Number ${studentRoll}, Son / Daughter of ${parentName}, is a bonafide student of Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar. He / She is currently enrolled in the four-year degree course in ${course}, Department of ${dept}, currently pursuing ${sem} during the academic session ${academicYear}.`;

    doc.text(p1, 42, startY, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p2 = `This certificate is issued upon the student's request to enable them to undergo Summer Industrial Internship / Training (SIP) at ${company} in the designation / role of "${role}" during the period from ${startDate} to ${endDate} in ${mode} mode.`;

    doc.text(p2, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p3 = `The institution has No Objection to the student undergoing the aforesaid internship program during the specified dates, subject to institutional regulations and adherence to academic requirements. During their period of study at this college, the student has maintained good conduct, character, and regular academic standing.`;

    doc.text(p3, { width: pageWidth - 84, align: 'justify' });

    // Training & Placement Verification Metadata Box
    const metaY = doc.y + 16;
    doc.rect(42, metaY, pageWidth - 84, 56).fill('#f8fafc');
    doc.rect(42, metaY, pageWidth - 84, 56).lineWidth(0.5).stroke('#93c5fd');

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e40af').text('TRAINING & PLACEMENT CELL ENDORSEMENT:', 52, metaY + 8);
    doc.font('Helvetica').fontSize(8).fillColor('#334155').lineGap(2);
    doc.text(`Host Organization: ${company} · Location/Mode: ${mode}`, 52, metaY + 22);
    doc.text(`Internship Tenure: ${startDate} to ${endDate} · Role: ${role}`, 52, metaY + 34);
    doc.text(`Approval Ref: T&P-SIP-${app.applicationNumber} · Clearance Status: VERIFIED & APPROVED`, 52, metaY + 46);

    // Signatures & Stamp
    this.renderSignatures(doc, qrBuffer, 'Head, Training & Placement', 'Principal / Director');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. TEMPLATE B: SCHOLARSHIP HOSTELLER / BOARDER STUDENT DECLARATION
  // ─────────────────────────────────────────────────────────────────────────────
  private renderScholarshipHostellerContent(doc: any, app: any, cert: any, qrBuffer: Buffer | null) {
    const pageWidth = doc.page.width;
    const fData = app.formData || {};
    const refNo = cert?.certificateNumber || `GIFT/SCH/HOSTELLER/2026/${app.applicationNumber.replace(/[^0-9]/g, '').slice(-4)}`;
    const issueDate = cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    // Ref No and Date Row
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text(`Ref. No.: ${refNo}`, 42, 90);
    doc.text(`Date: ${issueDate}`, pageWidth - 160, 90, { width: 118, align: 'right' });

    // Certificate Title Box
    doc.rect(42, 114, pageWidth - 84, 30).fill('#f1f5f9');
    doc.rect(42, 114, pageWidth - 84, 30).lineWidth(0.75).stroke('#cbd5e1');
    doc.fillColor('#0f2b48').font('Helvetica-Bold').fontSize(11).text(
      'BONAFIDE HOSTELLER / BOARDER STUDENT DECLARATION CERTIFICATE',
      42,
      118,
      { width: pageWidth - 84, align: 'center' },
    );
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#dc2626').text(
      '(FOR POST-MATRIC & NATIONAL / STATE SCHOLARSHIP SCHEMES)',
      42,
      131,
      { width: pageWidth - 84, align: 'center' },
    );

    // Main Certificate Body
    const startY = 160;
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b').lineGap(6);

    const studentName = (app.studentName || 'Student').toUpperCase();
    const studentRoll = app.studentRoll;
    const parentName = fData.parentName || 'Parent / Guardian';
    const course = fData.course || 'B.Tech';
    const dept = fData.department || 'Computer Science & Engineering';
    const courseYear = fData.courseYear || '3rd Year';
    const academicYear = app.academicYear || '2026-27';
    const scholarshipScheme = fData.scholarshipScheme || 'PRERANA Post-Matric Scholarship (SSD Department)';
    const hostelName = fData.hostelName || 'Sarojini Girls Residence (Block A)';
    const roomNumber = fData.roomNumber || '204';
    const admissionDate = fData.hostelAdmissionDate || '15-07-2024';

    const p1 = `This is to certify that ${studentName}, Son / Daughter of ${parentName}, bearing Enrolment / Registration Number ${studentRoll}, is a bonafide student of Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar, admitted to the ${course} Programme in ${dept}, currently pursuing ${courseYear} during the academic session ${academicYear}.`;

    doc.text(p1, 42, startY, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p2 = `IT IS HEREBY DECLARED AND CERTIFIED that as per authoritative institutional records maintained by the Hostel Residence Directorate, the above-named student is an authentic HOSTELLER / BOARDER residing in the institutional hostel: "${hostelName}", Room Number: ${roomNumber}, admitted on ${admissionDate}.`;

    doc.text(p2, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p3 = `The student is currently residing in the hostel premises and paying regular institutional hostel accommodation, establishment, and mess/dining charges. This certificate is officially verified and issued to the student for submission towards the scholarship scheme: "${scholarshipScheme}" for the academic session ${academicYear}.`;

    doc.text(p3, { width: pageWidth - 84, align: 'justify' });

    // Verified Hostel Details Card
    const metaY = doc.y + 14;
    doc.rect(42, metaY, pageWidth - 84, 58).fill('#ecfdf5');
    doc.rect(42, metaY, pageWidth - 84, 58).lineWidth(0.75).stroke('#059669');

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#065f46').text('HOSTEL RESIDENCE DIRECTORATE VERIFICATION RECORD:', 52, metaY + 8);
    doc.font('Helvetica').fontSize(8).fillColor('#1e293b').lineGap(2);
    doc.text(`Hostel Residence: ${hostelName} · Room: ${roomNumber}`, 52, metaY + 22);
    doc.text(`Occupancy Status: ACTIVE HOSTELLER (Verified against Biometric & Registry Data)`, 52, metaY + 34);
    doc.text(`Scholarship Scheme: ${scholarshipScheme} · Session: ${academicYear}`, 52, metaY + 46);

    // Signatures
    this.renderSignatures(doc, qrBuffer, 'Hostel Warden / Officer', 'Principal / Director');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TEMPLATE C: STUDY LOAN BONAFIDE & 4-YEAR COURSE FEE STRUCTURE
  // ─────────────────────────────────────────────────────────────────────────────
  private renderStudyLoanContent(doc: any, app: any, cert: any, qrBuffer: Buffer | null) {
    const pageWidth = doc.page.width;
    const fData = app.formData || {};
    const refNo = cert?.certificateNumber || `GIFT/ACC/FEE-BONAFIDE/2026/${app.applicationNumber.replace(/[^0-9]/g, '').slice(-4)}`;
    const issueDate = cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    // Ref No and Date Row
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a').text(`Ref. No.: ${refNo}`, 42, 85);
    doc.text(`Date: ${issueDate}`, pageWidth - 160, 85, { width: 118, align: 'right' });

    // Bank Addressee
    const bankName = fData.bankName || 'State Bank of India';
    const branchName = fData.branchName || 'Bhubaneswar Main Branch';
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text('To,', 42, 98);
    doc.font('Helvetica').fontSize(8.5).text(`The Branch Manager,\n${bankName}, ${branchName}.`, 42, 108);

    // Title
    doc.rect(42, 134, pageWidth - 84, 22).fill('#f1f5f9');
    doc.rect(42, 134, pageWidth - 84, 22).lineWidth(0.75).stroke('#cbd5e1');
    doc.fillColor('#0f2b48').font('Helvetica-Bold').fontSize(10).text(
      'BONAFIDE CERTIFICATE & APPROVED 4-YEAR COURSE FEE STRUCTURE',
      42,
      139,
      { width: pageWidth - 84, align: 'center' },
    );

    // Preamble
    const studentName = (app.studentName || 'Student').toUpperCase();
    const studentRoll = app.studentRoll;
    const parentName = fData.parentName || 'Parent / Guardian';
    const course = fData.course || 'B.Tech';
    const dept = fData.department || 'Computer Science & Engineering';
    const isHosteller = fData.residencyType === 'Hosteller';

    doc.font('Helvetica').fontSize(8.5).fillColor('#1e293b').lineGap(4);
    const p1 = `This is to certify that ${studentName}, S/D of ${parentName}, bearing Roll / Admission No. ${studentRoll}, is a bonafide student of Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar, admitted to the 4-Year B.Tech Programme in ${dept}. Residency Category: ${isHosteller ? 'HOSTELLER (Includes verified hostel & boarding charges)' : 'OUTSIDE RESIDENT / DAY SCHOLAR (Excludes hostel boarding)'}.`;

    doc.text(p1, 42, 162, { width: pageWidth - 84, align: 'justify' });

    // Dynamic 4-Year Course Fee Table
    const tableTop = 205;
    const colWidths = [185, 65, 65, 65, 65, 66];
    const colX = [42];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colX.push(colX[i] + colWidths[i]);
    }

    // Table Header
    doc.rect(42, tableTop, pageWidth - 84, 20).fill('#0f2b48');
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff');
    doc.text('Approved Fee Particulars', colX[0] + 6, tableTop + 6);
    doc.text('Year 1 (₹)', colX[1], tableTop + 6, { width: colWidths[1], align: 'center' });
    doc.text('Year 2 (₹)', colX[2], tableTop + 6, { width: colWidths[2], align: 'center' });
    doc.text('Year 3 (₹)', colX[3], tableTop + 6, { width: colWidths[3], align: 'center' });
    doc.text('Year 4 (₹)', colX[4], tableTop + 6, { width: colWidths[4], align: 'center' });
    doc.text('Total (₹)', colX[5], tableTop + 6, { width: colWidths[5], align: 'center' });

    // Fee items
    const tuitionYearly = 130000;
    const devYearly = 30000;
    const labYearly = 20000;
    const examYearly = 7000;
    const hostelYearly = isHosteller ? 84000 : 0;

    const rows = [
      { name: 'Tuition Fee (Approved)', y1: tuitionYearly, y2: tuitionYearly, y3: tuitionYearly, y4: tuitionYearly },
      { name: 'Institutional Development Fee', y1: devYearly, y2: devYearly, y3: devYearly, y4: devYearly },
      { name: 'Laboratory & Library Consumables', y1: labYearly, y2: labYearly, y3: labYearly, y4: labYearly },
      { name: 'Examination & University Assessment', y1: examYearly, y2: examYearly, y3: examYearly, y4: examYearly },
    ];

    if (isHosteller) {
      rows.push({ name: 'Hostel Accommodation & Residence', y1: 42000, y2: 42000, y3: 42000, y4: 42000 });
      rows.push({ name: 'Mess & Dining Charges (Annual)', y1: 42000, y2: 42000, y3: 42000, y4: 42000 });
    }

    let currY = tableTop + 20;
    const rowHeight = 16;

    doc.font('Helvetica').fontSize(7.5).fillColor('#1e293b');

    rows.forEach((r, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.rect(42, currY, pageWidth - 84, rowHeight).fill(bg);
      doc.rect(42, currY, pageWidth - 84, rowHeight).lineWidth(0.25).stroke('#cbd5e1');

      const sum = r.y1 + r.y2 + r.y3 + r.y4;
      doc.fillColor('#0f172a').text(r.name, colX[0] + 6, currY + 4);
      doc.text(r.y1.toLocaleString('en-IN'), colX[1], currY + 4, { width: colWidths[1], align: 'center' });
      doc.text(r.y2.toLocaleString('en-IN'), colX[2], currY + 4, { width: colWidths[2], align: 'center' });
      doc.text(r.y3.toLocaleString('en-IN'), colX[3], currY + 4, { width: colWidths[3], align: 'center' });
      doc.text(r.y4.toLocaleString('en-IN'), colX[4], currY + 4, { width: colWidths[4], align: 'center' });
      doc.font('Helvetica-Bold').text(sum.toLocaleString('en-IN'), colX[5], currY + 4, { width: colWidths[5], align: 'center' });
      doc.font('Helvetica');

      currY += rowHeight;
    });

    // Grand Totals Row
    const y1Tot = rows.reduce((acc, r) => acc + r.y1, 0);
    const y2Tot = rows.reduce((acc, r) => acc + r.y2, 0);
    const y3Tot = rows.reduce((acc, r) => acc + r.y3, 0);
    const y4Tot = rows.reduce((acc, r) => acc + r.y4, 0);
    const grandTot = y1Tot + y2Tot + y3Tot + y4Tot;

    doc.rect(42, currY, pageWidth - 84, 18).fill('#eff6ff');
    doc.rect(42, currY, pageWidth - 84, 18).lineWidth(0.75).stroke('#3b82f6');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e3a8a');
    doc.text('FOUR-YEAR GRAND TOTAL (₹):', colX[0] + 6, currY + 4);
    doc.text(y1Tot.toLocaleString('en-IN'), colX[1], currY + 4, { width: colWidths[1], align: 'center' });
    doc.text(y2Tot.toLocaleString('en-IN'), colX[2], currY + 4, { width: colWidths[2], align: 'center' });
    doc.text(y3Tot.toLocaleString('en-IN'), colX[3], currY + 4, { width: colWidths[3], align: 'center' });
    doc.text(y4Tot.toLocaleString('en-IN'), colX[4], currY + 4, { width: colWidths[4], align: 'center' });
    doc.text(grandTot.toLocaleString('en-IN'), colX[5], currY + 4, { width: colWidths[5], align: 'center' });

    // Note for Bank
    const noteY = currY + 24;
    doc.font('Helvetica').fontSize(7.5).fillColor('#475569').lineGap(2);
    doc.text(
      'Note: Payment may be remitted via Demand Draft / RTGS in favour of "GANDHI INSTITUTE FOR TECHNOLOGY", Payable at Bhubaneswar. Fees once paid are non-refundable.',
      42,
      noteY,
      { width: pageWidth - 84 },
    );

    // Signatures
    this.renderSignatures(doc, qrBuffer, 'Accounts Officer / Bursar', 'Principal / Director');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. TEMPLATE D: COLLEGE EVENT / EXTERNAL PARTICIPATION AUTHORIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  private renderExternalEventContent(doc: any, app: any, cert: any, qrBuffer: Buffer | null) {
    const pageWidth = doc.page.width;
    const fData = app.formData || {};
    const refNo = cert?.certificateNumber || `GIFT/ACT/EVENT-AUTH/2026/${app.applicationNumber.replace(/[^0-9]/g, '').slice(-4)}`;
    const issueDate = cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

    // Ref No and Date Row
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text(`Ref. No.: ${refNo}`, 42, 90);
    doc.text(`Date: ${issueDate}`, pageWidth - 160, 90, { width: 118, align: 'right' });

    // Title Box
    doc.rect(42, 114, pageWidth - 84, 28).fill('#f1f5f9');
    doc.rect(42, 114, pageWidth - 84, 28).lineWidth(0.75).stroke('#cbd5e1');
    doc.fillColor('#0f2b48').font('Helvetica-Bold').fontSize(11).text(
      'INSTITUTIONAL AUTHORIZATION & BONAFIDE LETTER',
      42,
      121,
      { width: pageWidth - 84, align: 'center' },
    );

    // Main Certificate Body
    const startY = 162;
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b').lineGap(6);

    const studentName = (app.studentName || 'Student').toUpperCase();
    const studentRoll = app.studentRoll;
    const course = fData.course || 'B.Tech';
    const dept = fData.department || 'Computer Science & Engineering';
    const eventName = fData.eventName || 'BPUT State Level Hackathon 2026';
    const organizer = fData.organizer || 'BPUT Technical University / Government of Odisha';
    const location = fData.location || 'Rourkela / Bhubaneswar Campus';
    const startDate = fData.startDate || '28-10-2026';
    const endDate = fData.endDate || '30-10-2026';
    const participationType = fData.participationType || 'Team';
    const teamName = fData.teamName || 'Apna Campus Pioneers';
    const teamMembers = fData.teamMembers || 'Bishnu Prasad Sahoo, Rakesh Das, Priya Patra';
    const mentor = fData.mentor || 'Prof. Sudhanshu S. Ray';

    const p1 = `This is to certify that ${studentName}, bearing Registration / Roll Number ${studentRoll}, is a bonafide student of Gandhi Institute For Technology (GIFT) Autonomous, Bhubaneswar, enrolled in the ${course} Programme, Department of ${dept}.`;

    doc.text(p1, 42, startY, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p2 = `The college authorities have officially permitted and authorized the student to represent this institution at the upcoming external competition / event: "${eventName}", organized by ${organizer} at ${location} scheduled from ${startDate} to ${endDate}.`;

    doc.text(p2, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p3 = `Participation Type: ${participationType} · Team Name: "${teamName}".\nTeam Members: ${teamMembers}.\nFaculty Coordinator / Mentor: ${mentor}.`;

    doc.text(p3, { width: pageWidth - 84, align: 'justify' });

    doc.moveDown(1.2);

    const p4 = `The student is granted Official Academic Duty (OD) leave for the duration of the event. The college extends best wishes to the participant(s) for a successful and commendable performance.`;

    doc.text(p4, { width: pageWidth - 84, align: 'justify' });

    // Authorization Details Box
    const metaY = doc.y + 14;
    doc.rect(42, metaY, pageWidth - 84, 52).fill('#faf5ff');
    doc.rect(42, metaY, pageWidth - 84, 52).lineWidth(0.5).stroke('#c084fc');

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#6b21a8').text('INSTITUTIONAL NOMINATION RECORD:', 52, metaY + 8);
    doc.font('Helvetica').fontSize(8).fillColor('#1e293b').lineGap(2);
    doc.text(`Event: ${eventName} · Organized by: ${organizer}`, 52, metaY + 22);
    doc.text(`Official Duty Status: AUTHORIZED & GRANTED (Official representation)`, 52, metaY + 34);

    // Signatures
    this.renderSignatures(doc, qrBuffer, 'Faculty Coordinator', 'Principal / Director');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. GENERIC CONTENT FALLBACK
  // ─────────────────────────────────────────────────────────────────────────────
  private renderGenericContent(doc: any, app: any, cert: any, qrBuffer: Buffer | null) {
    const pageWidth = doc.page.width;
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b').text(
      `This is to certify that ${app.studentName} (${app.studentRoll}) is a bonafide student of GIFT Autonomous, Bhubaneswar for ${app.purposeTitle}.`,
      42,
      160,
      { width: pageWidth - 84 },
    );
    this.renderSignatures(doc, qrBuffer, 'Authorized Officer', 'Principal / Director');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. SIGNATURES & STAMP STRIP
  // ─────────────────────────────────────────────────────────────────────────────
  private renderSignatures(doc: any, qrBuffer: Buffer | null, leftSignTitle: string, rightSignTitle: string) {
    const pageWidth = doc.page.width;
    const signY = 700;

    // QR Code in bottom left
    if (qrBuffer) {
      try {
        doc.image(qrBuffer, 42, signY - 22, { width: 56, height: 56 });
        doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#0f2b48').text('SCAN TO VERIFY', 42, signY + 36, { width: 56, align: 'center' });
      } catch (err: any) {
        this.logger.warn(`Failed to place QR: ${err.message}`);
      }
    }

    // Official Seal Graphic (Circular Seal)
    const sealX = 230;
    doc.circle(sealX + 24, signY + 8, 24).lineWidth(1).stroke('#1d4ed8');
    doc.circle(sealX + 24, signY + 8, 21).lineWidth(0.5).stroke('#93c5fd');
    doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#1d4ed8').text('GIFT AUTONOMOUS', sealX, signY - 3, { width: 48, align: 'center' });
    doc.text('OFFICIAL SEAL', sealX, signY + 5, { width: 48, align: 'center' });
    doc.text('BHUBANESWAR', sealX, signY + 13, { width: 48, align: 'center' });

    // Left Signature
    doc.moveTo(115, signY + 20).lineTo(215, signY + 20).lineWidth(0.5).stroke('#475569');
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0f172a').text(leftSignTitle, 115, signY + 24, { width: 100, align: 'center' });
    doc.font('Helvetica').fontSize(6.5).fillColor('#64748b').text('GIFT Autonomous, Bhubaneswar', 115, signY + 34, { width: 100, align: 'center' });

    // Right Signature (Principal)
    const rightX = pageWidth - 162;
    doc.moveTo(rightX, signY + 20).lineTo(rightX + 120, signY + 20).lineWidth(0.5).stroke('#475569');
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text(rightSignTitle, rightX, signY + 24, { width: 120, align: 'center' });
    doc.font('Helvetica').fontSize(6.5).fillColor('#64748b').text('GIFT Autonomous, Bhubaneswar', rightX, signY + 35, { width: 120, align: 'center' });

    // Bottom Footer Bar
    doc.rect(42, 800, pageWidth - 84, 0.5).stroke('#cbd5e1');
    doc.font('Helvetica').fontSize(6).fillColor('#94a3b8').text(
      'This is an authentic institutional document issued by GIFT Autonomous, Bhubaneswar. Valid only with official seal and verified credential token.',
      42,
      805,
      { width: pageWidth - 84, align: 'center' },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. DRAFT WATERMARK (For Non-Final Previews)
  // ─────────────────────────────────────────────────────────────────────────────
  private renderDraftWatermark(doc: any) {
    doc.save();
    doc.rotate(-45, { origin: [297.64, 420.95] });
    doc.font('Helvetica-Bold').fontSize(62).fillColor('#f1f5f9').text('DRAFT PREVIEW', 80, 390, {
      align: 'center',
    });
    doc.fontSize(16).fillColor('#cbd5e1').text('NOT AN OFFICIAL CERTIFICATE', 80, 460, {
      align: 'center',
    });
    doc.restore();
  }
}
