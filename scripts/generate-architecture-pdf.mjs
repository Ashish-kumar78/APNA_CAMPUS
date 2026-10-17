import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from '../frontend/node_modules/jspdf/dist/jspdf.node.min.js';
import autoTablePkg from '../frontend/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js';

const autoTable = autoTablePkg.default || autoTablePkg;

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 14;
const contentWidth = pageWidth - margin * 2;

// Colors
const primaryColor = [30, 41, 59];      // Slate 800 (#1e293b)
const accentColor = [79, 70, 229];      // Indigo 600 (#4f46e5)
const secondaryColor = [71, 85, 105];   // Slate 600 (#475569)
const lightBg = [248, 250, 252];        // Slate 50 (#f8fafc)
const borderColor = [226, 232, 240];    // Slate 200 (#e2e8f0)
const darkText = [15, 23, 42];          // Slate 900 (#0f172a)

let currentY = margin;

function checkPageBreak(neededHeight) {
  if (currentY + neededHeight > pageHeight - 20) {
    doc.addPage();
    currentY = margin + 10;
    return true;
  }
  return false;
}

function renderSectionHeader(title, iconSymbol = '■') {
  checkPageBreak(18);
  currentY += 4;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin, currentY, 3, 7, 1, 1, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(title, margin + 6, currentY + 5.5);
  
  currentY += 10;
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 4;
}

// -------------------------------------------------------------
// COVER / HEADER BANNER
// -------------------------------------------------------------
doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.rect(0, 0, pageWidth, 42, 'F');

// Top Accent line
doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
doc.rect(0, 40, pageWidth, 2, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(20);
doc.setTextColor(255, 255, 255);
doc.text('Apna Campus (CollegeFlow)', margin, 18);

doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(203, 213, 225);
doc.text('System Architecture & Technology Stack Specification', margin, 26);
doc.setFontSize(8.5);
doc.setTextColor(148, 163, 184);
doc.text('Autonomous BPUT College ERP · Monorepo Architecture · 14 Role Portals', margin, 33);

currentY = 48;

// Metadata Bar
doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');
doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
doc.setLineWidth(0.3);
doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
doc.text('DOCUMENT VERSION:', margin + 4, currentY + 6);
doc.text('ARCHITECTURE STYLE:', margin + 60, currentY + 6);
doc.text('DATE GENERATED:', margin + 125, currentY + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
doc.text('v1.0 (Enterprise Specification)', margin + 4, currentY + 10.5);
doc.text('Full-Stack Monorepo (3-Tier)', margin + 60, currentY + 10.5);
doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), margin + 125, currentY + 10.5);

currentY += 20;

// -------------------------------------------------------------
// 1. EXECUTIVE SUMMARY & ARCHITECTURE OVERVIEW
// -------------------------------------------------------------
renderSectionHeader('1. Executive Architecture Overview');

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.setTextColor(darkText[0], darkText[1], darkText[2]);

const summaryText = 
  'Apna Campus (CollegeFlow) is an enterprise-grade, autonomous college ERP and institutional management system designed specifically for autonomous engineering institutions (BPUT autonomous curriculum compliant). The solution is structured as a unified monorepo providing modular backend services, role-based security, and 14 dedicated interactive client portals.';

const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
doc.text(splitSummary, margin, currentY);
currentY += splitSummary.length * 4.5 + 2;

// Architecture Layers Table
autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['Tier / Layer', 'Core Technology', 'Default Port', 'Architectural Role & Description']],
  body: [
    ['Presentation (Client)', 'React 18, Vite 6, Tailwind CSS', '5173', 'SPA with 14 role-based portals, glassmorphism UI, client PDF generation, and real-time dashboard analytics.'],
    ['Application (API)', 'NestJS 10, TypeScript 5.7', '4000', 'Enterprise REST API gateway with dependency injection, Passport JWT, RBAC guards, global validation, and Swagger docs.'],
    ['Auxiliary Feeds (API)', 'Express.js 4 (Node.js)', '5000', 'Lightweight social feed microservice powering CampusConnect posts, media, and universal WhatsApp launcher.'],
    ['Persistence (Data)', 'PostgreSQL 14+, Prisma ORM 5.22', '5432', 'Relational database with strict foreign keys, enums, migrations, and idempotent seed generation.'],
  ],
  theme: 'striped',
  headStyles: {
    fillColor: primaryColor,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8.5,
  },
  bodyStyles: {
    textColor: darkText,
    fontSize: 8,
    cellPadding: 2.5,
  },
  columnStyles: {
    0: { cellWidth: 38, fontStyle: 'bold' },
    1: { cellWidth: 44 },
    2: { cellWidth: 22, halign: 'center' },
    3: { cellWidth: 'auto' },
  },
});

currentY = doc.lastAutoTable.finalY + 4;

// -------------------------------------------------------------
// 2. COMPLETE TECHNOLOGY STACK MATRIX
// -------------------------------------------------------------
renderSectionHeader('2. Detailed Technology Stack Matrix');

// Frontend Stack Table
autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['Layer', 'Technology / Library', 'Version', 'Purpose & Implementation Scope']],
  body: [
    ['Frontend', 'React', '18.3.1', 'Component-based reactive UI architecture & virtual DOM'],
    ['Frontend', 'Vite', '6.0.5', 'High-performance ES module dev server & optimized production rollup builder'],
    ['Frontend', 'Tailwind CSS', '3.4.16', 'Utility-first modern styling framework & responsive design system'],
    ['Frontend', 'React Router DOM', '6.28.0', 'Client-side routing, navigation protection & portal view routing'],
    ['Frontend', 'Lucide React', '0.468.0', 'Modern, unified SVG iconography across all 14 portals'],
    ['Frontend', 'Recharts', '2.15.0', 'Interactive analytics for attendance, marks trends, and fee collection'],
    ['Frontend', 'jsPDF & AutoTable', '4.2 / 5.0', 'Client-side generation of fee receipts, hall tickets & grade sheets'],
    ['Frontend', 'SheetJS (XLSX)', '0.18.5', 'Excel spreadsheet parsing and roster/mark sheet export'],
    ['Frontend', 'Zod', '3.23.8', 'Type-safe schema validation for form submissions and inputs'],
    ['Frontend', 'Vitest & JSDOM', '2.1 / 26.0', 'Fast unit and browser-environment component testing'],
    ['Backend', 'NestJS Core / Common', '10.4.15', 'Modular DI framework, routing, controllers, services, and modules'],
    ['Backend', 'TypeScript', '5.7.2', 'End-to-end type safety, decorators, and interfaces across all modules'],
    ['Backend', 'Passport & JWT', '0.7 / 4.0', 'Stateless Bearer JWT token strategy with claim verification'],
    ['Backend', 'bcryptjs', '2.4.3', 'Salted password hashing for credential security'],
    ['Backend', 'Swagger (OpenAPI)', '7.4.2', 'Automated OpenAPI 3.0 documentation generated at /api/docs'],
    ['Backend', 'class-validator & transformer', '0.14 / 0.5', 'Global ValidationPipe whitelist parsing, type casting & DTO contracts'],
    ['Backend', 'Multer', '2.4.0', 'Multipart file processing for payment proofs & student doc uploads'],
    ['Backend', 'RxJS', '7.8.1', 'Reactive stream operators for interceptors and async request handlers'],
    ['Database', 'PostgreSQL', '14+', 'ACID relational database engine with indexes, cascading deletes & enums'],
    ['Database', 'Prisma ORM', '5.22.0', 'Type-safe schema modeling, query engine & automated client generation'],
    ['Database', 'Prisma Migrate', '5.22.0', 'Committed version-controlled migration files in backend/prisma/migrations'],
  ],
  theme: 'grid',
  headStyles: {
    fillColor: accentColor,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8.5,
  },
  bodyStyles: {
    textColor: darkText,
    fontSize: 7.5,
    cellPadding: 2,
  },
  columnStyles: {
    0: { cellWidth: 26, fontStyle: 'bold' },
    1: { cellWidth: 42, fontStyle: 'bold' },
    2: { cellWidth: 20, halign: 'center' },
    3: { cellWidth: 'auto' },
  },
});

currentY = doc.lastAutoTable.finalY + 4;

// -------------------------------------------------------------
// 3. THE 14 DEDICATED ROLE PORTALS
// -------------------------------------------------------------
renderSectionHeader('3. Dedicated Role Portals & Access Scopes');

autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['#', 'Role Portal', 'Identifier / Access', 'Core Responsibilities & Capabilities']],
  body: [
    ['1', 'Super Admin', 'SYS-SUPER-01 / superadmin', 'Enterprise security, database backups, audit logs, system-wide role provisioning.'],
    ['2', 'Management', 'GOV-CHAIR-01 / management', 'Executive financial dashboards, admission statistics, institutional KPI oversight.'],
    ['3', 'Principal', 'OFF-PRIN-01 / principal', 'Autonomous institution governance, faculty performance, accreditation compliance.'],
    ['4', 'Admin', 'ADM-001 / admin', 'Department master tables, staff onboarding, academic calendar and timetable scheduling.'],
    ['5', 'HOD', 'HOD-CSE-001 / hod', 'Branch-specific performance metrics, faculty allocation, internal marks verification.'],
    ['6', 'Faculty', 'FAC-042 / faculty', 'Attendance recording, continuous evaluation marks entry, missed class notes sharing.'],
    ['7', 'Student', '2305201001 / student', 'Academic profile, fee payment proofs, gate pass requests, semester results, timetable.'],
    ['8', 'Exam Cell', 'EXM-001 / exam_cell', 'Autonomous examination scheduling, hall ticket generation, seating plans, grading rules.'],
    ['9', 'Accounts', 'ACC-001 / accounts', 'Online fee verification, UPI/challan reconciliation, dues clearance, receipt issuance.'],
    ['10', 'Library', 'LIB-001 / library', 'Book catalog management, RFID/barcode issue-return logs, digital journal access.'],
    ['11', 'Placement', 'TPO-001 / placement', 'Campus recruitment drives, student eligibility filtering, interview rounds, offers.'],
    ['12', 'Transport', 'TRN-001 / transport', 'Bus route planning, vehicle GPS fleet status, driver assignments, transport passes.'],
    ['13', 'Hostel / Warden', 'HST-001 / hostel', 'Room allotment, digital gate pass approval, biometric in/out logs, mess feedback.'],
    ['14', 'Canteen / Staff', 'CNT-001 / canteen', 'Cafeteria menu management, cashless student wallet transactions, order fulfillment.'],
  ],
  theme: 'striped',
  headStyles: {
    fillColor: primaryColor,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8.5,
  },
  bodyStyles: {
    textColor: darkText,
    fontSize: 7.5,
    cellPadding: 2,
  },
  columnStyles: {
    0: { cellWidth: 8, halign: 'center' },
    1: { cellWidth: 32, fontStyle: 'bold' },
    2: { cellWidth: 44 },
    3: { cellWidth: 'auto' },
  },
});

currentY = doc.lastAutoTable.finalY + 4;

// -------------------------------------------------------------
// 4. CORE SUBSYSTEMS & BUSINESS WORKFLOWS
// -------------------------------------------------------------
renderSectionHeader('4. Key Domain Subsystems & Business Logic');

const workflows = [
  {
    title: 'A. Role-Based Access Control (RBAC) & Security Architecture',
    desc: 'The backend uses Passport JWT with a custom RolesGuard and @Roles() metadata decorator. Passwords are salted with bcryptjs. In the frontend, route protection and portal switching ensure users only view actions strictly within their privilege domain.'
  },
  {
    title: 'B. Digital Fee Payment Proof & Accounts Verification',
    desc: 'Students upload payment receipts (UPI/NEFT/Challan) with transaction reference numbers. The Accounts section accesses a verification queue (/api/accounts/payment-verifications) to approve or reject with remarks, immediately updating ledger balances and triggering dynamic PDF fee receipts.'
  },
  {
    title: 'C. Examination Cell, Grading & Autonomous Marks Moderation',
    desc: 'Supports internal assessment (30 marks) and end-term examinations (70 marks) tailored to BPUT autonomous engineering standards. Features automated SGPA/CGPA computation, grade conversion, backlog tracking, and PDF hall ticket generation with barcode verification.'
  },
  {
    title: 'D. Biometric Attendance & Dual-Step Hostel Gate Pass',
    desc: 'Integrates real-time biometric tracking for hostel entry/exit. Gate pass requests initiate a multi-tier authorization workflow (Hostel Warden review -> Security Gate verification) complete with dynamic security QR codes and timestamped logging.'
  },
  {
    title: 'E. AI Campus Assistant (Apna AI Chatbot) & CampusConnect',
    desc: 'Built-in intelligent campus virtual assistant answering student queries on syllabus, dues, exams, and policies. Augmented by CampusConnect social feed and universal WhatsApp launcher for automated student-faculty communication.'
  }
];

workflows.forEach((wf) => {
  checkPageBreak(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(wf.title, margin, currentY);
  currentY += 4.5;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  const splitDesc = doc.splitTextToSize(wf.desc, contentWidth);
  doc.text(splitDesc, margin, currentY);
  currentY += splitDesc.length * 3.8 + 3.5;
});

// -------------------------------------------------------------
// 5. DEPLOYMENT & PRODUCTION INFRASTRUCTURE
// -------------------------------------------------------------
renderSectionHeader('5. Infrastructure, DevOps & Cloud Readiness');

autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [['Component', 'Target Platform / Tool', 'Configuration Details']],
  body: [
    ['Frontend Hosting', 'Vercel / Static CDN', 'Configured via vercel.json with SPA catch-all rewrites to /index.html.'],
    ['Backend Hosting', 'Render / Docker Node.js', 'Configured via render.yaml; auto-detects cloud SSL mode (sslmode=require) for databases.'],
    ['Database Hosting', 'PostgreSQL (Render / Supabase / Neon)', 'PostgreSQL connection string with automated pooling & SSL enforcement.'],
    ['Monorepo Concurrency', 'Concurrently 9.2', 'Root npm run dev runs dev:backend and dev:frontend in parallel with color-coded logs.'],
    ['Developer Onboarding', 'PowerShell Script', 'Automated setup via scripts/setup-dev.ps1 checking Node, npm, PostgreSQL, env & migrations.'],
  ],
  theme: 'grid',
  headStyles: {
    fillColor: primaryColor,
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 8.5,
  },
  bodyStyles: {
    textColor: darkText,
    fontSize: 7.5,
    cellPadding: 2,
  },
  columnStyles: {
    0: { cellWidth: 38, fontStyle: 'bold' },
    1: { cellWidth: 44, fontStyle: 'bold' },
    2: { cellWidth: 'auto' },
  },
});

// -------------------------------------------------------------
// FOOTER & PAGE NUMBERING (ALL PAGES)
// -------------------------------------------------------------
const totalPages = doc.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  
  // Footer line
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Apna Campus (CollegeFlow) — Confidential & Proprietary Architecture Specification', margin, pageHeight - 8);
  
  const pageStr = `Page ${i} of ${totalPages}`;
  doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 8);
}

// Write to file
const outputPath = path.resolve(process.cwd(), 'Apna_Campus_Architecture_and_Tech_Stack.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log(`PDF successfully generated at: ${outputPath}`);
console.log(`Total Pages: ${totalPages}`);
