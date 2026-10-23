import { Injectable, BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './reports.dto';
import { normalizeRole } from '../rbac/rbac';
import * as XLSX from 'xlsx';

export interface ReportSummary {
  totalStudents: number;
  averageMetric: number;
  metricLabel: string;
  recordsRequiringAttention: number;
  attentionLabel: string;
  totalMatchingRecords: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Get Dynamic Filter Configurations with Role Scoping
  async getFilterOptions(user: any) {
    const role = normalizeRole(user?.role || '');

    const facultyAssignmentsPromise = role === 'faculty' && user?.faculty?.id
      ? this.prisma.facultyAssignment.findMany({
          where: { facultyId: user.faculty.id },
          include: { courseOffering: true },
          orderBy: [{ academicYear: 'desc' }, { createdAt: 'asc' }],
        })
      : Promise.resolve([]);
    const [departments, students, facultyAssignments] = await Promise.all([
      this.prisma.department.findMany({ orderBy: { code: 'asc' }, select: { code: true, name: true } }),
      this.prisma.student.findMany({ select: { semester: true, academicYear: true, section: true } }),
      facultyAssignmentsPromise,
    ]);
    const unique = (values: Array<string | null | undefined>) => [...new Set(values.filter((value): value is string => Boolean(value?.trim())))].sort();
    const semesters = unique(students.map((student) => student.semester)).map((label) => ({
      number: Number(label.match(/\d+/)?.[0]) || null,
      label,
    }));
    const batches = unique(students.map((student) => student.academicYear));
    const sections = unique(students.map((student) => student.section));
    const reportTypes = [
      { id: 'attendance', name: 'Attendance Report', description: 'Subject & class attendance percentages with held/present counts' },
      { id: 'cgpa', name: 'CGPA Report', description: 'Cumulative grade point averages & academic standing' },
      { id: 'sgpa', name: 'SGPA Report', description: 'Unavailable until certified semester results are configured', available: false },
      { id: 'document', name: 'Document Status Report', description: 'Student document submission, verification & compliance registry' },
    ];

    // Determine role restrictions
    let isBranchRestricted = false;
    let allowedBranches: string[] = departments.map((d) => d.code);
    let defaultBranch = '';

    if (role === 'hod') {
      isBranchRestricted = true;
      const deptCode = this.getDeptCodeFromUser(user);
      allowedBranches = deptCode ? [deptCode] : [];
      defaultBranch = deptCode || '';
    } else if (role === 'faculty') {
      isBranchRestricted = true;
      const deptCode = this.getDeptCodeFromUser(user);
      allowedBranches = deptCode ? [deptCode] : [];
      defaultBranch = deptCode || '';
    }

    return {
      success: true,
      branches: departments.map((d) => ({
        code: d.code,
        name: d.name,
        isAllowed: allowedBranches.includes(d.code),
      })),
      semesters,
      batches,
      sections,
      assignedClasses: facultyAssignments.map((assignment) => ({
        facultyId: user.faculty.employeeId,
        facultyName: user.name,
        subjectCode: assignment.courseOffering.subjectCode,
        subjectName: assignment.courseOffering.subjectName,
        semester: assignment.courseOffering.semester,
        academicYear: assignment.academicYear,
        section: assignment.section,
        department: assignment.courseOffering.department,
      })),
      reportTypes,
      userScope: {
        role,
        department: user?.department || null,
        isBranchRestricted,
        allowedBranches,
        defaultBranch,
      },
    };
  }

  // 2. Core Report Data Engine
  async generateReport(query: ReportQueryDto, user: any) {
    this.validateDateRange(query.dateFrom, query.dateTo);
    const role = normalizeRole(user?.role || '');

    // Authorization & scoping
    const allowedRoles = [
      'super_admin',
      'management',
      'principal',
      'admin',
      'hod',
      'faculty',
      'exam_cell',
      'staff',
      'placement',
      'hostel',
      'warden',
      'accounts',
    ];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(`Role "${user?.role}" is not authorized to generate academic reports.`);
    }

    let scopedBranch = query.branch;
    if (role === 'hod' || role === 'faculty') {
      const userDeptCode = this.getDeptCodeFromUser(user);
      if (!userDeptCode) throw new ForbiddenException('Your account has no verified department assignment for academic reports.');
      if (scopedBranch && scopedBranch !== 'All' && scopedBranch !== userDeptCode) {
        throw new ForbiddenException(
          `Unauthorized scope: ${role.toUpperCase()} is restricted to their assigned department (${userDeptCode}).`,
        );
      }
      scopedBranch = userDeptCode;
    }

    // Fetch matching students from database with relations
    const allStudents = await this.fetchStudentsFromDb(scopedBranch, query.semester, query.section, query.search, query.batch);

    // Compute student reports based on requested type
    const reportType = (query.reportType || 'attendance').toLowerCase();
    let records: any[] = [];
    let summary: ReportSummary;

    switch (reportType) {
      case 'cgpa': {
        const res = this.buildCgpaReport(allStudents, query);
        records = res.records;
        summary = res.summary;
        break;
      }
      case 'sgpa': {
        throw new ServiceUnavailableException('Semester grades are unavailable until certified semester results are stored.');
      }
      case 'document': {
        const res = this.buildDocumentReport(allStudents, query);
        records = res.records;
        summary = res.summary;
        break;
      }
      case 'attendance':
      default: {
        const res = await this.buildAttendanceReport(allStudents, query, scopedBranch);
        records = res.records;
        summary = res.summary;
        break;
      }
    }

    // Apply sorting
    if (query.sortBy) {
      records = this.sortRecords(records, query.sortBy, query.sortOrder || 'asc');
    }

    // Re-assign Sl. No. sequentially after filtering & sorting
    records.forEach((r, idx) => {
      r.slNo = idx + 1;
    });

    const totalMatching = records.length;

    // Apply pagination
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 25);
    const startIndex = (page - 1) * limit;
    const paginatedData = records.slice(startIndex, startIndex + limit);

    return {
      success: true,
      reportType,
      meta: {
        title: this.getReportTitle(reportType),
        generatedAt: new Date().toISOString(),
        generatedBy: user?.name || 'Administrator',
        userRole: role,
        appliedFilters: {
          branch: scopedBranch || 'All Branches',
          semester: query.semester || 'All Semesters',
          batch: query.batch || 'All Batches',
          section: query.section || 'All Sections',
          dateFrom: query.dateFrom || null,
          dateTo: query.dateTo || null,
          search: query.search || null,
        },
        dateBasis: this.getDateBasisDescription(reportType, query.dateFrom, query.dateTo),
        pagination: {
          page,
          limit,
          total: totalMatching,
          totalPages: Math.ceil(totalMatching / limit) || 1,
        },
      },
      summary: {
        ...summary,
        totalMatchingRecords: totalMatching,
      },
      data: paginatedData,
      allMatchingCount: totalMatching,
    };
  }

  // 3. Excel Export Generator (.xlsx)
  async generateExcelExport(query: ReportQueryDto, user: any) {
    // Generate entire un-paginated dataset for export
    const result = await this.generateReport({ ...query, page: 1, limit: 100000 }, user);
    const reportType = result.reportType;
    const records = result.data;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Prepare metadata and header block
    const metaHeader = [
      ['APNA CAMPUS ENTERPRISE ACADEMIC SYSTEM'],
      [`REPORT: ${result.meta.title.toUpperCase()}`],
      [`Generated On: ${new Date().toLocaleString()} | User: ${result.meta.generatedBy} (${result.meta.userRole})`],
      [
        `Filters Applied: Branch: ${result.meta.appliedFilters.branch} | Sem: ${result.meta.appliedFilters.semester} | Batch: ${result.meta.appliedFilters.batch} | Sec: ${result.meta.appliedFilters.section} | Date Range: ${result.meta.appliedFilters.dateFrom || 'N/A'} to ${result.meta.appliedFilters.dateTo || 'N/A'}`,
      ],
      [`Date Basis: ${result.meta.dateBasis}`],
      [
        `Summary KPIs: Total Students: ${result.summary.totalStudents} | ${result.summary.metricLabel}: ${result.summary.averageMetric} | ${result.summary.attentionLabel}: ${result.summary.recordsRequiringAttention}`,
      ],
      [], // blank separator row
    ];

    // Prepare table headers and rows based on report type
    let tableHeaders: string[] = [];
    let tableRows: any[][] = [];

    if (reportType === 'attendance') {
      tableHeaders = [
        'Sl. No.',
        'Student Name',
        'Registration Number',
        'Branch',
        'Semester',
        'Section',
        'Total Classes Held',
        'Present',
        'Absent',
        'Attendance Percentage',
      ];
      tableRows = records.map((r: any) => [
        r.slNo,
        r.studentName,
        r.registrationNumber,
        r.branch,
        r.semester,
        r.section,
        r.totalClassesHeld,
        r.present,
        r.absent,
        r.attendancePercentage,
      ]);
    } else if (reportType === 'cgpa') {
      tableHeaders = [
        'Sl. No.',
        'Student Name',
        'Registration Number',
        'Branch',
        'Semester',
        'Section',
        'Batch',
        'CGPA',
        'Academic Status',
      ];
      tableRows = records.map((r: any) => [
        r.slNo,
        r.studentName,
        r.registrationNumber,
        r.branch,
        r.semester,
        r.section,
        r.batch,
        r.cgpa,
        r.academicStatus,
      ]);
    } else if (reportType === 'sgpa') {
      tableHeaders = [
        'Sl. No.',
        'Student Name',
        'Registration Number',
        'Branch',
        'Semester',
        'Section',
        'Batch',
        'SGPA',
        'Result Status',
      ];
      tableRows = records.map((r: any) => [
        r.slNo,
        r.studentName,
        r.registrationNumber,
        r.branch,
        r.semester,
        r.section,
        r.batch,
        r.sgpa,
        r.resultStatus,
      ]);
    } else if (reportType === 'document') {
      tableHeaders = [
        'Sl. No.',
        'Student Name',
        'Registration Number',
        'Branch',
        'Semester',
        'Section',
        'Batch',
        'Total Documents Required',
        'Documents Submitted',
        'Documents Verified',
        'Documents Pending',
        'Verification Status',
      ];
      tableRows = records.map((r: any) => [
        r.slNo,
        r.studentName,
        r.registrationNumber,
        r.branch,
        r.semester,
        r.section,
        r.batch,
        r.totalRequired,
        r.submitted,
        r.verified,
        r.pending,
        r.verificationStatus,
      ]);
    }

    const fullSheetData = [...metaHeader, tableHeaders, ...tableRows];
    const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

    // Set column widths
    const colWidths = tableHeaders.map((header) => ({
      wch: Math.max(header.length + 4, 15),
    }));
    colWidths[0] = { wch: 8 }; // Sl. No.
    colWidths[1] = { wch: 26 }; // Student Name
    colWidths[2] = { wch: 22 }; // Reg No
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'ReportData');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Build standard filename
    const dateStr = new Date().toISOString().split('T')[0];
    const branchPart = (query.branch || 'ALL').replace(/[^a-zA-Z0-9]/g, '');
    const semPart = query.semester ? query.semester.replace(/[^a-zA-Z0-9]/g, '') : 'AllSem';

    let filename = `ApnaCampus_Attendance_${branchPart}_${semPart}_${dateStr}.xlsx`;
    if (reportType === 'cgpa') {
      filename = `ApnaCampus_CGPA_${branchPart}_${dateStr}.xlsx`;
    } else if (reportType === 'sgpa') {
      filename = `ApnaCampus_SGPA_${branchPart}_${semPart}_${dateStr}.xlsx`;
    } else if (reportType === 'document') {
      filename = `ApnaCampus_Document_Report_${branchPart}_${dateStr}.xlsx`;
    }

    return {
      buffer,
      filename,
    };
  }

  // ─── PRIVATE REPORT BUILDERS & CALCULATIONS ────────────────────────────────

  private async buildAttendanceReport(students: any[], query: ReportQueryDto, branch?: string) {
    const where: any = {};
    if (query.dateFrom || query.dateTo) where.date = { ...(query.dateFrom ? { gte: query.dateFrom } : {}), ...(query.dateTo ? { lte: query.dateTo } : {}) };
    if (query.semester && query.semester !== 'All') where.semester = query.semester.includes('Semester') ? query.semester : `Semester ${query.semester}`;
    if (query.section && query.section !== 'All') where.section = query.section.includes('Section') ? query.section : `Section ${query.section}`;
    const sessions = await this.prisma.attendanceSession.findMany({ where, select: { entries: true } });
    const studentsById = new Map(students.map((student) => [student.id, student]));
    const attendance = new Map<string, { held: number; present: number }>();
    for (const session of sessions) {
      const entries = Array.isArray(session.entries) ? session.entries as any[] : [];
      for (const entry of entries) {
        const student = studentsById.get(entry.studentId);
        if (!student || typeof entry.present !== 'boolean') continue;
        const current = attendance.get(student.id) || { held: 0, present: 0 };
        current.held += 1;
        if (entry.present) current.present += 1;
        attendance.set(student.id, current);
      }
    }
    if (attendance.size === 0) throw new ServiceUnavailableException('Attendance reports are unavailable because no matching persisted attendance sessions exist.');
    let totalHeld = 0;
    let totalPresent = 0;
    let belowThreshold = 0;
    const records = students.flatMap((student, index) => {
      const counts = attendance.get(student.id);
      if (!counts || counts.held === 0) return [];
      const percentage = Number(((counts.present / counts.held) * 100).toFixed(2));
      totalHeld += counts.held;
      totalPresent += counts.present;
      if (percentage < 75) belowThreshold += 1;
      return [{ slNo: index + 1, studentName: student.name, registrationNumber: student.studentId || student.rollNumber || null,
        branch: student.deptCode || student.department || null, semester: student.semester || null,
        section: student.section || null, batch: student.academicYear || null, totalClassesHeld: counts.held,
        present: counts.present, absent: counts.held - counts.present, attendancePercentage: percentage.toFixed(2) + '%', rawPercentage: percentage }];
    });
    const average = totalHeld ? Number(((totalPresent / totalHeld) * 100).toFixed(2)) : 0;
    return { records, summary: { totalStudents: records.length, averageMetric: average, metricLabel: 'Average Attendance Rate (%)',
      recordsRequiringAttention: belowThreshold, attentionLabel: 'Students below 75% attendance', totalMatchingRecords: records.length } };
  }

  private buildCgpaReport(students: any[], _query: ReportQueryDto) {
    const graded = students.filter((student) => typeof student.cgpa === 'number' && Number.isFinite(student.cgpa));
    if (graded.length === 0) throw new ServiceUnavailableException('CGPA reports are unavailable because no persisted CGPA values exist for the selected students.');
    let belowThresholdCount = 0;
    const records = graded.map((student, index) => {
      const cgpa = Number(student.cgpa.toFixed(2));
      let academicStatus = 'Good Standing';
      if (cgpa >= 9) academicStatus = "Dean's Honors List";
      else if (cgpa >= 8) academicStatus = 'Good Standing (Distinction)';
      else if (cgpa >= 6.5) academicStatus = 'Good Standing (First Class)';
      else if (cgpa < 5) { academicStatus = 'Academic Warning / Review'; belowThresholdCount += 1; }
      return { slNo: index + 1, studentName: student.name, registrationNumber: student.studentId || student.rollNumber || null,
        branch: student.deptCode || student.department || null, semester: student.semester || null,
        section: student.section || null, batch: student.academicYear || null, cgpa, academicStatus };
    });
    const average = Number((graded.reduce((sum, student) => sum + student.cgpa, 0) / graded.length).toFixed(2));
    return { records, summary: { totalStudents: records.length, averageMetric: average, metricLabel: 'Average persisted CGPA',
      recordsRequiringAttention: belowThresholdCount, attentionLabel: 'Students below academic standing threshold', totalMatchingRecords: records.length } };
  }

  private buildDocumentReport(students: any[], _query: ReportQueryDto) {
    let submittedTotal = 0;
    let verifiedTotal = 0;
    let studentsWithPendingDocuments = 0;
    const records = students.map((student, index) => {
      const documents = Array.isArray(student.documents) ? student.documents : [];
      const submitted = documents.length;
      const verified = documents.filter((document: any) => document.status?.toLowerCase() === 'verified' || document.verifiedByAdmin === true).length;
      const pending = submitted - verified;
      if (pending > 0) studentsWithPendingDocuments += 1;
      submittedTotal += submitted;
      verifiedTotal += verified;
      return { slNo: index + 1, studentName: student.name, registrationNumber: student.studentId || student.rollNumber || null,
        branch: student.deptCode || student.department || null, semester: student.semester || null,
        section: student.section || null, batch: student.academicYear || null, totalRequired: null,
        submitted, verified, pending, verificationStatus: submitted === 0 ? 'No documents recorded' : pending === 0 ? 'All recorded documents verified' : 'Verification pending' };
    });
    const compliance = submittedTotal ? Number(((verifiedTotal / submittedTotal) * 100).toFixed(1)) : 0;
    return { records, summary: { totalStudents: records.length, averageMetric: compliance, metricLabel: 'Recorded documents verified (%)',
      recordsRequiringAttention: studentsWithPendingDocuments, attentionLabel: 'Students with recorded documents pending verification', totalMatchingRecords: records.length } };
  }

  private validateDateRange(from?: string, to?: string) {
    if (from && to) {
      const d1 = new Date(from);
      const d2 = new Date(to);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new BadRequestException('Invalid date format provided for date range filter. Use YYYY-MM-DD.');
      }
      if (d1 > d2) {
        throw new BadRequestException('Validation Error: Date From cannot be later than Date To.');
      }
    }
  }

  private getDeptCodeFromUser(user: any): string | null {
    const raw = (user?.hod?.deptCode || user?.faculty?.department || user?.department || '').toUpperCase();
    if (raw.includes('CSE') || raw.includes('COMPUTER SCIENCE')) return 'CSE';
    if (raw.includes('AIML') || raw.includes('ARTIFICIAL INTELLIGENCE')) return 'AIML';
    if (raw.includes('ECE') || raw.includes('ELECTRONICS')) return 'ECE';
    if (raw.includes('EEE') || raw.includes('ELECTRICAL')) return 'EEE';
    if (raw.includes('MECH') || raw.includes('MECHANICAL')) return 'MECH';
    if (raw.includes('CIVIL')) return 'CIVIL';
    if (raw.includes('MBA')) return 'MBA';
    if (raw.includes('MCA')) return 'MCA';
    return null;
  }

  private getReportTitle(reportType: string): string {
    switch (reportType) {
      case 'cgpa':
        return 'Student Cumulative CGPA & Academic Standing Report';
      case 'sgpa':
        return 'Student Semester SGPA & Examination Performance Report';
      case 'document':
        return 'Student Document Compliance & Verification Status Report';
      case 'attendance':
      default:
        return 'Student Attendance & Class Participation Summary Report';
    }
  }

  private getDateBasisDescription(reportType: string, from?: string, to?: string): string {
    if (from && to) {
      return `Records and class sessions held between ${from} and ${to} (instructional days only)`;
    }
    return 'Cumulative academic session records (Autumn 2026-27 Autonomous Term)';
  }

  private sortRecords(records: any[], sortBy: string, sortOrder: string): any[] {
    const isAsc = sortOrder.toLowerCase() === 'asc';
    return [...records].sort((a, b) => {
      let vA = a[sortBy];
      let vB = b[sortBy];

      if (vA === undefined || vA === null) vA = '';
      if (vB === undefined || vB === null) vB = '';

      // Numeric comparison
      if (typeof vA === 'number' && typeof vB === 'number') {
        return isAsc ? vA - vB : vB - vA;
      }

      // Percentage or currency string
      if (typeof vA === 'string' && vA.endsWith('%') && typeof vB === 'string' && vB.endsWith('%')) {
        const nA = parseFloat(vA);
        const nB = parseFloat(vB);
        return isAsc ? nA - nB : nB - nA;
      }

      // String comparison
      const strA = String(vA).toLowerCase();
      const strB = String(vB).toLowerCase();
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }

  private async fetchStudentsFromDb(
    branch?: string,
    semester?: string,
    section?: string,
    search?: string,
    academicYear?: string,
  ) {
    const where: any = {};

    if (branch && branch !== 'All') {
      where.OR = [{ deptCode: branch }, { department: { contains: branch, mode: 'insensitive' } }];
    }

    if (semester && semester !== 'All') {
      where.semester = semester.includes('Semester') ? semester : `Semester ${semester}`;
    }

    if (section && section !== 'All') {
      where.section = section.includes('Section') ? section : `Section ${section}`;
    }

    if (academicYear && academicYear !== 'All') where.academicYear = academicYear;

    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { rollNumber: { contains: q, mode: 'insensitive' } },
            { studentId: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    return this.prisma.student.findMany({
      where,
      include: { documents: true },
      orderBy: { rollNumber: 'asc' },
    });
  }
}
