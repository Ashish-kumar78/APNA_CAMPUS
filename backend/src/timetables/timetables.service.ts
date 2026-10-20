import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimetableSolverService, SolverProblemInput } from './timetables.solver.service';
import { TimetableValidationService } from './timetables.validation.service';
import * as XLSX from 'xlsx';

@Injectable()
export class TimetablesService {
  private readonly logger = new Logger(TimetablesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly solverService: TimetableSolverService,
    private readonly validationService: TimetableValidationService,
  ) {}

  // ==========================================
  // ROOMS & LABORATORIES MASTER DATA
  // ==========================================
  async getRooms(department?: string, isLab?: boolean) {
    const where: any = {};
    if (department && department !== 'All') where.department = department;
    if (isLab !== undefined) where.isLab = isLab;
    return this.prisma.room.findMany({
      where,
      orderBy: { roomNumber: 'asc' },
    });
  }

  async createRoom(data: any) {
    return this.prisma.room.create({
      data: {
        roomNumber: data.roomNumber.trim(),
        building: data.building || 'Main Academic Block',
        floor: data.floor || '3rd Floor',
        roomType: data.roomType || 'CLASSROOM',
        capacity: Number(data.capacity) || 60,
        department: data.department || 'CSE',
        isLab: Boolean(data.isLab),
        facilities: data.facilities || [],
        status: data.status || 'Active',
      },
    });
  }

  async updateRoom(id: string, data: any) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async deleteRoom(id: string) {
    return this.prisma.room.delete({ where: { id } });
  }

  // ==========================================
  // ACADEMIC SCHEDULE CONFIGURATION
  // ==========================================
  async getScheduleConfig(academicYear = '2026-27', department = 'CSE') {
    let config = await this.prisma.academicScheduleConfig.findUnique({
      where: { academicYear_department: { academicYear, department } },
    });

    if (!config) {
      // Default institutional slots
      const defaultTimings = [
        { period: 1, startTime: '08:30 AM', endTime: '09:30 AM', isBreak: false, label: 'Period 1' },
        { period: 2, startTime: '09:30 AM', endTime: '10:30 AM', isBreak: false, label: 'Period 2' },
        { period: 3, startTime: '10:30 AM', endTime: '11:30 AM', isBreak: false, label: 'Period 3' },
        { period: 4, startTime: '11:30 AM', endTime: '12:30 PM', isBreak: false, label: 'Period 4' },
        { period: 5, startTime: '12:30 PM', endTime: '01:30 PM', isBreak: true, label: 'Lunch Break' },
        { period: 6, startTime: '01:30 PM', endTime: '02:30 PM', isBreak: false, label: 'Period 5' },
        { period: 7, startTime: '02:30 PM', endTime: '03:30 PM', isBreak: false, label: 'Period 6' },
        { period: 8, startTime: '03:30 PM', endTime: '04:30 PM', isBreak: false, label: 'Period 7' },
      ];

      config = await this.prisma.academicScheduleConfig.create({
        data: {
          academicYear,
          department,
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          periodsPerDay: 8,
          slotTimings: defaultTimings,
          lunchBreakPeriod: 4, // 0-indexed period index 4
          maxConsecutiveTheory: 3,
          maxDailyFacultyPeriods: 4,
          preferredLabDays: ['Tuesday', 'Thursday', 'Friday'],
          isDefault: true,
        },
      });
    }

    return config;
  }

  async updateScheduleConfig(academicYear: string, department: string, data: any) {
    return this.prisma.academicScheduleConfig.upsert({
      where: { academicYear_department: { academicYear, department } },
      update: data,
      create: { academicYear, department, ...data },
    });
  }

  // ==========================================
  // FACULTY AVAILABILITY
  // ==========================================
  async getFacultyAvailabilities(facultyId?: string) {
    const where: any = {};
    if (facultyId) where.facultyId = facultyId;
    return this.prisma.facultyAvailability.findMany({
      where,
      include: { faculty: { select: { id: true, name: true, employeeId: true } } },
    });
  }

  async setFacultyAvailability(data: {
    facultyId: string;
    dayOfWeek: string;
    periodIndex: number;
    isAvailable: boolean;
    reason?: string;
  }) {
    return this.prisma.facultyAvailability.upsert({
      where: {
        facultyId_dayOfWeek_periodIndex: {
          facultyId: data.facultyId,
          dayOfWeek: data.dayOfWeek,
          periodIndex: data.periodIndex,
        },
      },
      update: { isAvailable: data.isAvailable, reason: data.reason },
      create: data,
    });
  }

  // ==========================================
  // PRE-FLIGHT MASTER DATA VALIDATION
  // ==========================================
  async preValidate(scope: {
    department: string;
    semester: string;
    section?: string;
    academicYear: string;
  }) {
    return this.validationService.preValidateMasterData(scope);
  }

  // ==========================================
  // TIMETABLE GENERATION JOB LIFECYCLE
  // ==========================================
  async createGenerationJob(params: {
    department: string;
    academicYear: string;
    semester: string;
    section?: string;
    programmeId?: string;
    scope?: string;
    constraintsConfig?: any;
    initiatedBy: string;
  }) {
    const job = await this.prisma.timetableGenerationJob.create({
      data: {
        department: params.department,
        academicYear: params.academicYear,
        semester: params.semester,
        section: params.section || 'Section A',
        programmeId: params.programmeId,
        scope: params.scope || 'SECTION',
        constraintsConfig: params.constraintsConfig || {},
        status: 'PENDING',
        progress: 10,
        stepName: 'Validating institutional constraints...',
        initiatedBy: params.initiatedBy,
      },
    });

    // Run async background generation
    this.executeGenerationJob(job.id, params).catch((err) => {
      this.logger.error(`Job ${job.id} failed asynchronously: ${err.message}`, err.stack);
    });

    return job;
  }

  async getGenerationJob(id: string) {
    const job = await this.prisma.timetableGenerationJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Generation job ${id} not found.`);
    return job;
  }

  async cancelGenerationJob(id: string) {
    const job = await this.prisma.timetableGenerationJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Job not found.`);
    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return job;
    }
    return this.prisma.timetableGenerationJob.update({
      where: { id },
      data: { status: 'FAILED', error: 'Generation cancelled by user request.' },
    });
  }

  /**
   * Background execution of generation job
   */
  private async executeGenerationJob(jobId: string, params: any) {
    try {
      // 1. Update status to VALIDATING
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: { status: 'VALIDATING', progress: 20, stepName: 'Verifying curriculum subjects & faculty...' },
      });

      // Fetch academic schedule config
      const config = await this.getScheduleConfig(params.academicYear, params.department);
      const workingDays = config.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const periodsPerDay = config.periodsPerDay || 8;
      const slotTimings = (config.slotTimings as any[]) || [];
      const breakPeriods: number[] = [];
      slotTimings.forEach((slot, idx) => {
        if (slot.isBreak) breakPeriods.push(idx);
      });
      if (breakPeriods.length === 0 && config.lunchBreakPeriod !== undefined) {
        breakPeriods.push(config.lunchBreakPeriod);
      }

      // Fetch Sections
      let targetSections = await this.prisma.section.findMany({
        where: {
          department: params.department,
          semester: params.semester,
        },
      });

      if (targetSections.length === 0) {
        // Fallback default section if none yet in DB
        targetSections = [
          {
            id: 'sec-a',
            section: params.section || 'Section A',
            semester: params.semester,
            department: params.department,
            studentsCount: 60,
            classRepresentative: null,
            room: 'Room 301',
            facultyCoordinator: 'Dr. P. Mohapatra',
          },
        ];
      }

      if (params.section && params.section !== 'All') {
        targetSections = targetSections.filter((s) => s.section === params.section);
      }

      // Fetch Subjects
      let subjects = await this.prisma.subject.findMany({
        where: {
          department: params.department,
          semester: params.semester,
        },
      });

      if (subjects.length === 0) {
        // Seed standard autonomous curriculum subjects if none present
        subjects = [
          { id: 'sub-cs501', code: 'CS501', name: 'Artificial Intelligence', department: params.department, semester: params.semester, credits: 4, type: 'Theory', assignedFaculty: 'Dr. P. Mohapatra', status: 'Active' },
          { id: 'sub-cs502', code: 'CS502', name: 'Machine Learning', department: params.department, semester: params.semester, credits: 4, type: 'Theory', assignedFaculty: 'Dr. S. Rath', status: 'Active' },
          { id: 'sub-cs503', code: 'CS503', name: 'Cloud Computing & DevOps', department: params.department, semester: params.semester, credits: 3, type: 'Theory', assignedFaculty: 'Prof. R. Nayak', status: 'Active' },
          { id: 'sub-cs504', code: 'CS504', name: 'Compiler Design', department: params.department, semester: params.semester, credits: 4, type: 'Theory', assignedFaculty: 'Dr. A. Panda', status: 'Active' },
          { id: 'sub-cs505', code: 'CS505', name: 'AI & Data Science Laboratory', department: params.department, semester: params.semester, credits: 2, type: 'Theory + Lab', assignedFaculty: 'Dr. P. Mohapatra', status: 'Active' },
          { id: 'sub-cs506', code: 'CS506', name: 'Applied Capstone Project', department: params.department, semester: params.semester, credits: 2, type: 'Theory + Lab', assignedFaculty: 'Dr. S. Mohanty', status: 'Active' },
        ];
      }

      // Fetch Faculty
      let faculty = await this.prisma.faculty.findMany({
        include: { availabilities: true },
      });

      if (faculty.length === 0) {
        faculty = [
          { id: 'fac-1', userId: null, employeeId: 'FAC-001', name: 'Dr. P. Mohapatra', email: 'p.mohapatra@apnacampus.edu.in', phone: null, department: params.department, designation: 'Professor', assignedSubjects: ['CS501', 'CS505'], assignedSections: ['Section A'], status: 'Active', createdAt: new Date(), updatedAt: new Date(), availabilities: [] },
          { id: 'fac-2', userId: null, employeeId: 'FAC-002', name: 'Dr. S. Rath', email: 's.rath@apnacampus.edu.in', phone: null, department: params.department, designation: 'Associate Professor', assignedSubjects: ['CS502'], assignedSections: ['Section A'], status: 'Active', createdAt: new Date(), updatedAt: new Date(), availabilities: [] },
          { id: 'fac-3', userId: null, employeeId: 'FAC-003', name: 'Prof. R. Nayak', email: 'r.nayak@apnacampus.edu.in', phone: null, department: params.department, designation: 'Assistant Professor', assignedSubjects: ['CS503'], assignedSections: ['Section A'], status: 'Active', createdAt: new Date(), updatedAt: new Date(), availabilities: [] },
          { id: 'fac-4', userId: null, employeeId: 'FAC-004', name: 'Dr. A. Panda', email: 'a.panda@apnacampus.edu.in', phone: null, department: params.department, designation: 'Associate Professor', assignedSubjects: ['CS504'], assignedSections: ['Section A'], status: 'Active', createdAt: new Date(), updatedAt: new Date(), availabilities: [] },
          { id: 'fac-5', userId: null, employeeId: 'FAC-005', name: 'Dr. S. Mohanty', email: 's.mohanty@apnacampus.edu.in', phone: null, department: params.department, designation: 'Associate Professor', assignedSubjects: ['CS506'], assignedSections: ['Section A'], status: 'Active', createdAt: new Date(), updatedAt: new Date(), availabilities: [] },
        ];
      }

      // Fetch Rooms
      let rooms = await this.prisma.room.findMany();
      if (rooms.length === 0) {
        // Seed default institutional rooms & labs
        await this.prisma.room.createMany({
          data: [
            { roomNumber: 'Room 301', building: 'Aryabhatta Block', floor: '3rd Floor', roomType: 'CLASSROOM', capacity: 65, department: params.department, isLab: false, facilities: ['Projector', 'Smart Podium'] },
            { roomNumber: 'Room 302', building: 'Aryabhatta Block', floor: '3rd Floor', roomType: 'SMART_CLASSROOM', capacity: 65, department: params.department, isLab: false, facilities: ['Interactive Touch Board', 'Surround Sound'] },
            { roomNumber: 'Room 204', building: 'Ramanujan Block', floor: '2nd Floor', roomType: 'CLASSROOM', capacity: 70, department: params.department, isLab: false, facilities: ['Projector'] },
            { roomNumber: 'Room 205', building: 'Ramanujan Block', floor: '2nd Floor', roomType: 'CLASSROOM', capacity: 60, department: params.department, isLab: false, facilities: ['Projector'] },
            { roomNumber: 'CS Lab-1', building: 'Turing Computer Centre', floor: '1st Floor', roomType: 'COMPUTER_LAB', capacity: 65, department: params.department, isLab: true, facilities: ['65 Intel i7 Workstations', 'GPU Cluster', 'Gigabit LAN'] },
            { roomNumber: 'CS Lab-2', building: 'Turing Computer Centre', floor: '1st Floor', roomType: 'COMPUTER_LAB', capacity: 65, department: params.department, isLab: true, facilities: ['60 Workstations', 'Dual Monitors'] },
            { roomNumber: 'Lab-3', building: 'Innovation Hub', floor: 'Ground Floor', roomType: 'HARDWARE_LAB', capacity: 60, department: params.department, isLab: true, facilities: ['IoT Testbeds', 'Robotics Kits'] },
            { roomNumber: 'Seminar Hall-1', building: 'Convention Centre', floor: 'Ground Floor', roomType: 'SEMINAR_HALL', capacity: 150, department: params.department, isLab: false, facilities: ['Dual HD Projectors', 'Wireless Mic Array'] },
          ],
        });
        rooms = await this.prisma.room.findMany();
      }

      // Step 2: Preparing Solver Requirements
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: { status: 'PREPARING', progress: 40, stepName: 'Building constraint satisfaction model...' },
      });

      const requirements: any[] = [];
      for (const sec of targetSections) {
        for (const sub of subjects) {
          const isLab = sub.type?.toLowerCase().includes('lab') || sub.type?.toLowerCase().includes('practical');
          // Weekly period requirements
          let periodsNeeded = 4;
          if (sub.credits === 3) periodsNeeded = 3;
          if (sub.credits === 2) periodsNeeded = 2;
          if (isLab) periodsNeeded = 2;

          // Match faculty
          let matchedFaculty = faculty.find((f) => f.name === sub.assignedFaculty);
          if (!matchedFaculty) {
            matchedFaculty = faculty.find((f) => f.assignedSubjects.includes(sub.code)) || faculty[0];
          }

          requirements.push({
            id: `req_${sec.section}_${sub.code}`,
            subjectCode: sub.code,
            subjectName: sub.name,
            section: sec.section,
            facultyId: matchedFaculty?.id,
            facultyName: matchedFaculty?.name,
            isLab,
            requiredPeriods: periodsNeeded,
            consecutivePeriods: isLab ? 2 : 1,
            credits: sub.credits,
          });
        }
      }

      // Step 3: SOLVING with CP-SAT Engine
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: { status: 'SOLVING', progress: 65, stepName: 'Executing Google OR-Tools CP-SAT solver...' },
      });

      const solverInput: SolverProblemInput = {
        workingDays,
        periodsPerDay,
        breakPeriods,
        sections: targetSections.map((s) => ({ id: s.id, name: s.section, studentCount: s.studentsCount || 60 })),
        rooms: rooms.map((r) => ({
          id: r.id,
          roomNumber: r.roomNumber,
          capacity: r.capacity,
          isLab: r.isLab,
          roomType: r.roomType,
        })),
        faculty: faculty.map((f) => ({
          id: f.id,
          name: f.name,
          unavailableSlots: (f.availabilities || [])
            .filter((a) => !a.isAvailable)
            .map((a) => ({ day: a.dayOfWeek, period: a.periodIndex })),
        })),
        requirements,
        preferences: params.constraintsConfig || {},
      };

      const solution = await this.solverService.solve(solverInput);

      if (solution.status === 'INFEASIBLE' || solution.status === 'FAILED') {
        await this.prisma.timetableGenerationJob.update({
          where: { id: jobId },
          data: {
            status: 'INFEASIBLE',
            progress: 100,
            stepName: 'No feasible timetable found.',
            infeasibilityReport: solution.infeasibilityReport as any,
            diagnostics: solution.solverDiagnostics as any,
            error: solution.message,
          },
        });
        return;
      }

      // Step 4: OPTIMIZING & INDEPENDENT VALIDATION
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: { status: 'OPTIMIZING', progress: 85, stepName: 'Verifying schedule conflicts independently...' },
      });

      // Prepare database Timetable draft
      const sectionName = params.section && params.section !== 'All' ? params.section : 'Section A';
      const title = `${params.department} · ${params.semester} (${sectionName}) Timetable`;

      // Assign time strings using slotTimings
      const enrichedEntries = solution.entries.map((entry) => {
        const slot = slotTimings[entry.periodIndex] || {
          startTime: `${8 + entry.periodIndex}:30 AM`,
          endTime: `${9 + entry.periodIndex}:30 AM`,
        };
        return {
          dayOfWeek: entry.dayOfWeek,
          periodIndex: entry.periodIndex,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectCode: entry.subjectCode,
          subjectName: entry.subjectName,
          subjectCredits: entry.subjectCredits,
          sessionType: entry.sessionType,
          facultyId: entry.facultyId,
          facultyName: entry.facultyName,
          roomId: entry.roomId,
          roomNumber: entry.roomNumber,
          section: entry.section,
          durationPeriods: entry.durationPeriods || 1,
          isConsecutive: entry.isConsecutive || false,
        };
      });

      // Independent conflict validation
      const validation = await this.validationService.validateTimetable('', enrichedEntries);

      // Save Timetable & Entries inside a transaction
      const createdTimetable = await this.prisma.$transaction(async (tx) => {
        // Find existing draft to version or archive
        const existingDraft = await tx.timetable.findFirst({
          where: {
            academicYear: params.academicYear,
            department: params.department,
            semester: params.semester,
            section: sectionName,
            status: { in: ['DRAFT', 'VALIDATED'] },
          },
        });

        if (existingDraft) {
          await tx.timetable.delete({ where: { id: existingDraft.id } });
        }

        const newTt = await tx.timetable.create({
          data: {
            title,
            academicYear: params.academicYear,
            semester: params.semester,
            department: params.department,
            section: sectionName,
            status: validation.isValid ? 'VALIDATED' : 'DRAFT',
            version: 1,
            isPublished: false,
            qualityScore: solution.qualityScore || 96.0,
            conflictCount: validation.hardConflictsCount,
            solverDiagnostics: solution.solverDiagnostics as any,
            generationJobId: jobId,
            createdBy: params.initiatedBy || 'HOD / Academic Administrator',
            entries: {
              create: enrichedEntries,
            },
            conflicts: {
              create: validation.conflicts.map((c) => ({
                conflictType: c.conflictType,
                severity: c.severity,
                dayOfWeek: c.dayOfWeek,
                periodIndex: c.periodIndex,
                subjectCode: c.subjectCode,
                facultyName: c.facultyName,
                roomNumber: c.roomNumber,
                section: c.section,
                description: c.description,
                suggestedAction: c.suggestedAction,
              })),
            },
          },
        });

        return newTt;
      });

      // Mark Job COMPLETED
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          stepName: 'Timetable generated and validated successfully!',
          resultTimetableId: createdTimetable.id,
          diagnostics: {
            totalEntries: enrichedEntries.length,
            conflictsCount: validation.hardConflictsCount,
            qualityScore: solution.qualityScore,
          },
        },
      });

      this.logger.log(`Timetable Generation Job ${jobId} succeeded -> Timetable ${createdTimetable.id}`);
    } catch (err: any) {
      this.logger.error(`Generation error: ${err?.message}`, err?.stack);
      await this.prisma.timetableGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          progress: 100,
          stepName: 'Generation failed due to an internal system error.',
          error: err?.message || 'Unknown error',
        },
      });
    }
  }

  // ==========================================
  // TIMETABLES RETRIEVAL & VIEWS
  // ==========================================
  async getTimetables(filters: {
    academicYear?: string;
    department?: string;
    semester?: string;
    section?: string;
    status?: any;
  }) {
    const where: any = {};
    if (filters.academicYear) where.academicYear = filters.academicYear;
    if (filters.department && filters.department !== 'All') where.department = filters.department;
    if (filters.semester && filters.semester !== 'All') where.semester = filters.semester;
    if (filters.section && filters.section !== 'All') where.section = filters.section;
    if (filters.status) where.status = filters.status;

    return this.prisma.timetable.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { entries: true, conflicts: true } },
      },
    });
  }

  async getTimetableById(id: string) {
    const tt = await this.prisma.timetable.findUnique({
      where: { id },
      include: {
        entries: { orderBy: [{ dayOfWeek: 'asc' }, { periodIndex: 'asc' }] },
        conflicts: true,
      },
    });
    if (!tt) throw new NotFoundException(`Timetable ${id} not found.`);
    return tt;
  }

  async getTimetableConflicts(id: string) {
    const timetable = await this.getTimetableById(id);
    const validation = await this.validationService.validateTimetable(id, timetable.entries);
    return validation;
  }

  // ==========================================
  // MANUAL EDITOR (SLOT REASSIGNMENT & VALIDATION)
  // ==========================================
  async updateTimetableEntry(
    timetableId: string,
    entryId: string,
    updateData: {
      dayOfWeek?: string;
      periodIndex?: number;
      roomId?: string;
      roomNumber?: string;
      facultyId?: string;
      facultyName?: string;
    },
    user: any,
  ) {
    const timetable = await this.getTimetableById(timetableId);
    if (timetable.status === 'PUBLISHED') {
      throw new ForbiddenException(
        'Published timetables cannot be modified directly. Please create a draft revision first.',
      );
    }

    const currentEntry = timetable.entries.find((e) => e.id === entryId);
    if (!currentEntry) throw new NotFoundException(`Timetable entry ${entryId} not found.`);

    // Simulate update on entry
    const simulatedEntries = timetable.entries.map((e) => {
      if (e.id === entryId) {
        return { ...e, ...updateData };
      }
      return e;
    });

    // Run independent constraint validation
    const validation = await this.validationService.validateTimetable(timetableId, simulatedEntries);

    if (!validation.isValid) {
      const topConflict = validation.conflicts.find((c) => c.severity === 'HARD');
      throw new BadRequestException({
        success: false,
        message: `Manual edit rejected: ${topConflict?.description || 'Constraint clash detected.'}`,
        conflict: topConflict,
        validation,
      });
    }

    // Apply update to DB
    const updatedEntry = await this.prisma.timetableEntry.update({
      where: { id: entryId },
      data: updateData,
    });

    // Update timetable conflict count
    await this.prisma.timetable.update({
      where: { id: timetableId },
      data: {
        conflictCount: validation.hardConflictsCount,
        qualityScore: validation.isValid ? 98.0 : 80.0,
      },
    });

    // Replace conflicts in DB
    await this.prisma.timetableConflict.deleteMany({ where: { timetableId } });
    if (validation.conflicts.length > 0) {
      await this.prisma.timetableConflict.createMany({
        data: validation.conflicts.map((c) => ({
          timetableId,
          conflictType: c.conflictType,
          severity: c.severity,
          dayOfWeek: c.dayOfWeek,
          periodIndex: c.periodIndex,
          subjectCode: c.subjectCode,
          facultyName: c.facultyName,
          roomNumber: c.roomNumber,
          section: c.section,
          description: c.description,
          suggestedAction: c.suggestedAction,
        })),
      });
    }

    return {
      success: true,
      message: 'Timetable entry successfully updated without constraint clashes.',
      entry: updatedEntry,
      validation,
    };
  }

  // ==========================================
  // APPROVAL & PUBLISHING LIFECYCLE
  // ==========================================
  async submitForApproval(id: string, user: any) {
    const tt = await this.getTimetableById(id);
    if (tt.status === 'PUBLISHED') {
      throw new BadRequestException('Timetable is already published.');
    }

    // Must be validated without hard conflicts before submitting
    const validation = await this.validationService.validateTimetable(id, tt.entries);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Cannot submit timetable with ${validation.hardConflictsCount} active hard conflict(s). Please resolve conflicts first.`,
      );
    }

    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
        conflictCount: 0,
      },
    });

    // Notify Principal and Management
    await this.prisma.notification.create({
      data: {
        role: 'PRINCIPAL',
        title: `Draft Timetable Pending Approval`,
        message: `${tt.title} submitted by ${user.name || user.identifier} is waiting for formal review and approval.`,
        time: 'Just now',
      },
    });

    return {
      success: true,
      message: 'Timetable successfully submitted to Principal for official approval.',
      timetable: updated,
    };
  }

  async approveTimetable(id: string, user: any) {
    const tt = await this.getTimetableById(id);
    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.name || user.identifier || 'Principal',
        approvedAt: new Date(),
      },
    });

    // Notify HOD
    await this.prisma.notification.create({
      data: {
        role: 'HOD',
        title: `Timetable Approved by Principal`,
        message: `${tt.title} has been officially approved. You can now publish it to students & faculty.`,
        time: 'Just now',
      },
    });

    return {
      success: true,
      message: 'Timetable approved by Principal.',
      timetable: updated,
    };
  }

  async publishTimetable(id: string, user: any) {
    const tt = await this.getTimetableById(id);

    // Archive previous published timetable for this scope
    await this.prisma.timetable.updateMany({
      where: {
        academicYear: tt.academicYear,
        department: tt.department,
        semester: tt.semester,
        section: tt.section,
        isPublished: true,
        id: { not: id },
      },
      data: {
        isPublished: false,
        status: 'ARCHIVED',
      },
    });

    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
        version: tt.version + 1,
        publishedBy: user.name || user.identifier || 'System Administrator',
        publishedAt: new Date(),
      },
    });

    // Broadcast Notifications to Students & Faculty
    await this.prisma.notification.createMany({
      data: [
        {
          role: 'STUDENT',
          title: `Official Timetable Published`,
          message: `Official weekly academic schedule for ${tt.department} ${tt.semester} (${tt.section}) is now active. View your updated slots.`,
          time: 'Just now',
        },
        {
          role: 'FACULTY',
          title: `Academic Schedule Published`,
          message: `New official teaching schedule published for ${tt.department}. Check assigned periods in your faculty console.`,
          time: 'Just now',
        },
      ],
    });

    return {
      success: true,
      message: `Official Timetable v${updated.version} published college-wide!`,
      timetable: updated,
    };
  }

  async rejectTimetable(id: string, rejectionReason: string, user: any) {
    const updated = await this.prisma.timetable.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason,
      },
    });

    await this.prisma.notification.create({
      data: {
        role: 'HOD',
        title: `Timetable Draft Rejected`,
        message: `Draft timetable was returned with remarks: "${rejectionReason}". Please revise and resubmit.`,
        time: 'Just now',
      },
    });

    return {
      success: true,
      message: 'Timetable returned for revision.',
      timetable: updated,
    };
  }

  // ==========================================
  // EXPORT & REPORTING (EXCEL, PDF, WORKLOAD)
  // ==========================================
  async exportToExcel(id: string): Promise<Buffer> {
    const tt = await this.getTimetableById(id);
    const config = await this.getScheduleConfig(tt.academicYear, tt.department);
    const workingDays = config.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Collect distinct periods
    const maxPeriod = Math.max(...tt.entries.map((e) => e.periodIndex), 7);
    const periods = Array.from({ length: maxPeriod + 1 }, (_, i) => i);

    // Matrix rows: Day x Period
    const rows: any[] = [];
    for (const day of workingDays) {
      const row: any = { Day: day };
      for (const p of periods) {
        const entry = tt.entries.find((e) => e.dayOfWeek === day && e.periodIndex === p);
        const colName = `Period ${p + 1}`;
        if (entry) {
          row[colName] = `${entry.subjectCode} (${entry.sessionType})\n${entry.subjectName}\nFac: ${entry.facultyName || 'TBD'}\nRm: ${entry.roomNumber || 'TBD'}`;
        } else {
          row[colName] = '—';
        }
      }
      rows.push(row);
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

    // Also add Workload Summary sheet
    const facultyWorkloadMap = new Map<string, number>();
    for (const e of tt.entries) {
      if (e.facultyName) {
        facultyWorkloadMap.set(e.facultyName, (facultyWorkloadMap.get(e.facultyName) || 0) + 1);
      }
    }

    const workloadRows = Array.from(facultyWorkloadMap.entries()).map(([fac, hours]) => ({
      'Faculty Member': fac,
      'Weekly Scheduled Hours': hours,
      'Max Recommended Load': 16,
      'Status': hours > 18 ? 'Heavy Load' : 'Balanced',
    }));
    const wlWorksheet = XLSX.utils.json_to_sheet(workloadRows);
    XLSX.utils.book_append_sheet(workbook, wlWorksheet, 'Faculty Workload');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async getWorkloadReport(department = 'CSE', academicYear = '2026-27') {
    const published = await this.prisma.timetable.findMany({
      where: { department, academicYear, isPublished: true },
      include: { entries: true },
    });

    const facultyMap = new Map<string, { totalHours: number; theoryHours: number; labHours: number; subjects: Set<string> }>();

    for (const tt of published) {
      for (const e of tt.entries) {
        const name = e.facultyName || 'Unassigned';
        if (!facultyMap.has(name)) {
          facultyMap.set(name, { totalHours: 0, theoryHours: 0, labHours: 0, subjects: new Set() });
        }
        const stat = facultyMap.get(name)!;
        stat.totalHours++;
        if (e.sessionType === 'LAB') stat.labHours++;
        else stat.theoryHours++;
        stat.subjects.add(e.subjectCode);
      }
    }

    return Array.from(facultyMap.entries()).map(([facultyName, stat]) => ({
      facultyName,
      department,
      totalHours: stat.totalHours,
      theoryHours: stat.theoryHours,
      labHours: stat.labHours,
      subjects: Array.from(stat.subjects),
      complianceStatus: stat.totalHours <= 18 ? 'Compliant' : 'Overloaded',
    }));
  }

  async getRoomUtilizationReport(department = 'CSE', academicYear = '2026-27') {
    const rooms = await this.prisma.room.findMany();
    const published = await this.prisma.timetable.findMany({
      where: { academicYear, isPublished: true },
      include: { entries: true },
    });

    const roomUsage = new Map<string, number>();
    for (const tt of published) {
      for (const e of tt.entries) {
        if (e.roomNumber) {
          roomUsage.set(e.roomNumber, (roomUsage.get(e.roomNumber) || 0) + 1);
        }
      }
    }

    // Assume 36 available periods/week (6 days * 6 working periods)
    const totalWeeklySlots = 36;
    return rooms.map((r) => {
      const booked = roomUsage.get(r.roomNumber) || 0;
      const utilizationRate = Math.min(100, Math.round((booked / totalWeeklySlots) * 100));
      return {
        id: r.id,
        roomNumber: r.roomNumber,
        building: r.building,
        roomType: r.roomType,
        isLab: r.isLab,
        capacity: r.capacity,
        bookedPeriods: booked,
        availablePeriods: Math.max(0, totalWeeklySlots - booked),
        utilizationRate,
        status: utilizationRate > 80 ? 'High Demand' : utilizationRate < 30 ? 'Underutilized' : 'Optimal',
      };
    });
  }

  // ==========================================
  // STUDENT & FACULTY SPECIFIC VIEWS
  // ==========================================
  async getStudentTimetable(department = 'CSE', semester = 'Semester 5', section = 'Section A') {
    // 1. Try to find active published timetable
    let tt = await this.prisma.timetable.findFirst({
      where: { department, semester, section, isPublished: true },
      include: { entries: { orderBy: [{ dayOfWeek: 'asc' }, { periodIndex: 'asc' }] } },
    });

    // 2. Fallback to latest draft if no published timetable exists yet
    if (!tt) {
      tt = await this.prisma.timetable.findFirst({
        where: { department, semester, section },
        orderBy: { updatedAt: 'desc' },
        include: { entries: { orderBy: [{ dayOfWeek: 'asc' }, { periodIndex: 'asc' }] } },
      });
    }

    const config = await this.getScheduleConfig('2026-27', department);

    return {
      timetable: tt,
      config,
    };
  }

  async getFacultyTimetable(facultyName: string) {
    const entries = await this.prisma.timetableEntry.findMany({
      where: {
        facultyName: { contains: facultyName, mode: 'insensitive' },
        timetable: { isPublished: true },
      },
      include: { timetable: { select: { title: true, department: true, semester: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { periodIndex: 'asc' }],
    });

    return entries;
  }
}
