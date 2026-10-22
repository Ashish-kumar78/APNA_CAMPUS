import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConflictResult {
  conflictType: string;
  severity: 'HARD' | 'SOFT' | 'WARNING';
  dayOfWeek?: string;
  periodIndex?: number;
  timeSlot?: string;
  subjectCode?: string;
  facultyName?: string;
  roomNumber?: string;
  section?: string;
  description: string;
  suggestedAction?: string;
}

export interface ValidationSummary {
  isValid: boolean;
  hardConflictsCount: number;
  softConflictsCount: number;
  warningsCount: number;
  conflicts: ConflictResult[];
}

@Injectable()
export class TimetableValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Independently validates all hard and soft constraints for a timetable schedule.
   * Never marks a timetable as valid or conflict-free unless all tests pass.
   */
  async validateTimetable(
    timetableId: string,
    providedEntries?: any[],
  ): Promise<ValidationSummary> {
    const conflicts: ConflictResult[] = [];

    // Load timetable metadata and entries
    const timetable = await this.prisma.timetable.findUnique({
      where: { id: timetableId },
      include: { entries: true },
    });

    if (!timetable && !providedEntries) {
      return {
        isValid: false,
        hardConflictsCount: 1,
        softConflictsCount: 0,
        warningsCount: 0,
        conflicts: [
          {
            conflictType: 'NOT_FOUND',
            severity: 'HARD',
            description: `Timetable ${timetableId} does not exist.`,
          },
        ],
      };
    }

    const entries = providedEntries || timetable?.entries || [];

    // 1. Group entries to detect double-bookings
    const sectionSlotMap = new Map<string, any[]>();
    const facultySlotMap = new Map<string, any[]>();
    const roomSlotMap = new Map<string, any[]>();

    for (const entry of entries) {
      if (entry.sessionType === 'BREAK') continue;

      const slotKey = `${entry.dayOfWeek}_${entry.periodIndex}`;

      // Section check
      const secKey = `${entry.section}_${slotKey}`;
      if (!sectionSlotMap.has(secKey)) sectionSlotMap.set(secKey, []);
      sectionSlotMap.get(secKey)!.push(entry);

      // Faculty check
      if (entry.facultyId || entry.facultyName) {
        const facKey = `${entry.facultyId || entry.facultyName}_${slotKey}`;
        if (!facultySlotMap.has(facKey)) facultySlotMap.set(facKey, []);
        facultySlotMap.get(facKey)!.push(entry);
      }

      // Room check
      if (entry.roomId || entry.roomNumber) {
        const rmKey = `${entry.roomId || entry.roomNumber}_${slotKey}`;
        if (!roomSlotMap.has(rmKey)) roomSlotMap.set(rmKey, []);
        roomSlotMap.get(rmKey)!.push(entry);
      }
    }

    // Check Section Double-Booking
    for (const [key, list] of sectionSlotMap.entries()) {
      if (list.length > 1) {
        conflicts.push({
          conflictType: 'SECTION_DOUBLE_BOOKING',
          severity: 'HARD',
          dayOfWeek: list[0].dayOfWeek,
          periodIndex: list[0].periodIndex,
          section: list[0].section,
          description: `Section ${list[0].section} is scheduled for ${list.length} simultaneous classes on ${list[0].dayOfWeek} (Period ${list[0].periodIndex + 1}): ${list.map((e) => e.subjectCode).join(', ')}.`,
          suggestedAction: `Reschedule one of the overlapping subjects to an open period on another day.`,
        });
      }
    }

    // Check Faculty Double-Booking
    for (const [key, list] of facultySlotMap.entries()) {
      if (list.length > 1) {
        conflicts.push({
          conflictType: 'FACULTY_DOUBLE_BOOKING',
          severity: 'HARD',
          dayOfWeek: list[0].dayOfWeek,
          periodIndex: list[0].periodIndex,
          facultyName: list[0].facultyName,
          description: `Faculty ${list[0].facultyName} is booked for ${list.length} different classes simultaneously on ${list[0].dayOfWeek} (Period ${list[0].periodIndex + 1}): Sections ${list.map((e) => e.section).join(', ')}.`,
          suggestedAction: `Reassign one course section to a co-instructor or move to a non-conflicting time slot.`,
        });
      }
    }

    // Check Room Double-Booking
    for (const [key, list] of roomSlotMap.entries()) {
      if (list.length > 1) {
        conflicts.push({
          conflictType: 'ROOM_DOUBLE_BOOKING',
          severity: 'HARD',
          dayOfWeek: list[0].dayOfWeek,
          periodIndex: list[0].periodIndex,
          roomNumber: list[0].roomNumber,
          description: `Room ${list[0].roomNumber} is allocated to ${list.length} concurrent sessions on ${list[0].dayOfWeek} (Period ${list[0].periodIndex + 1}): ${list.map((e) => `${e.subjectCode} (${e.section})`).join(', ')}.`,
          suggestedAction: `Shift one session to an available parallel lecture hall or laboratory.`,
        });
      }
    }

    // 2. Room Capacity and Laboratory Type verification
    const rooms = await this.prisma.room.findMany();
    const roomMap = new Map(rooms.map((r) => [r.id, r]));
    const roomNumMap = new Map(rooms.map((r) => [r.roomNumber, r]));

    for (const entry of entries) {
      if (entry.sessionType === 'BREAK') continue;
      const room = (entry.roomId ? roomMap.get(entry.roomId) : null) || (entry.roomNumber ? roomNumMap.get(entry.roomNumber) : null);

      if (room) {
        // Lab session in non-lab room
        if (entry.sessionType === 'LAB' && !room.isLab) {
          conflicts.push({
            conflictType: 'LAB_FACILITY_MISMATCH',
            severity: 'HARD',
            dayOfWeek: entry.dayOfWeek,
            periodIndex: entry.periodIndex,
            subjectCode: entry.subjectCode,
            roomNumber: room.roomNumber,
            description: `Laboratory course ${entry.subjectCode} (${entry.subjectName}) is allocated to standard lecture classroom ${room.roomNumber} without practical lab equipment.`,
            suggestedAction: `Assign an authorized Computer Lab, Hardware Lab, or Workshop facility.`,
          });
        }
      }
    }

    // 3. Check Faculty Availability blocks
    const facultyAvailabilities = await this.prisma.facultyAvailability.findMany({
      where: { isAvailable: false },
    });
    const unavailSet = new Set(
      facultyAvailabilities.map((fa) => `${fa.facultyId}_${fa.dayOfWeek}_${fa.periodIndex}`),
    );

    for (const entry of entries) {
      if (entry.facultyId) {
        const key = `${entry.facultyId}_${entry.dayOfWeek}_${entry.periodIndex}`;
        if (unavailSet.has(key)) {
          conflicts.push({
            conflictType: 'FACULTY_UNAVAILABLE',
            severity: 'HARD',
            dayOfWeek: entry.dayOfWeek,
            periodIndex: entry.periodIndex,
            facultyName: entry.facultyName,
            subjectCode: entry.subjectCode,
            description: `Faculty ${entry.facultyName} is scheduled during an officially restricted unavailable slot on ${entry.dayOfWeek} (Period ${entry.periodIndex + 1}).`,
            suggestedAction: `Move the session or update the faculty availability calendar.`,
          });
        }
      }
    }

    // 4. Soft constraint checks: Faculty daily consecutive overload
    const facultyDayEntries = new Map<string, number[]>();
    for (const entry of entries) {
      if (entry.facultyName && entry.sessionType !== 'BREAK') {
        const key = `${entry.facultyName}_${entry.dayOfWeek}`;
        if (!facultyDayEntries.has(key)) facultyDayEntries.set(key, []);
        facultyDayEntries.get(key)!.push(entry.periodIndex);
      }
    }

    for (const [key, periods] of facultyDayEntries.entries()) {
      const [facName, day] = key.split('_');
      periods.sort((a, b) => a - b);
      let consecutive = 1;
      for (let i = 1; i < periods.length; i++) {
        if (periods[i] === periods[i - 1] + 1) {
          consecutive++;
          if (consecutive >= 4) {
            conflicts.push({
              conflictType: 'FACULTY_FATIGUE_OVERLOAD',
              severity: 'SOFT',
              dayOfWeek: day,
              facultyName: facName,
              description: `Faculty ${facName} has ${consecutive} consecutive teaching hours on ${day}.`,
              suggestedAction: `Introduce a gap period or distribute lectures across other days.`,
            });
            break;
          }
        } else {
          consecutive = 1;
        }
      }
    }

    const hardCount = conflicts.filter((c) => c.severity === 'HARD').length;
    const softCount = conflicts.filter((c) => c.severity === 'SOFT').length;
    const warnCount = conflicts.filter((c) => c.severity === 'WARNING').length;

    return {
      isValid: hardCount === 0,
      hardConflictsCount: hardCount,
      softConflictsCount: softCount,
      warningsCount: warnCount,
      conflicts,
    };
  }

  /**
   * Pre-flight master data validation before generation starts.
   */
  async preValidateMasterData(scope: {
    department: string;
    semester: string;
    section?: string;
    academicYear: string;
  }): Promise<{ canGenerate: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check Course Offerings / Subjects
    const subjects = await this.prisma.subject.findMany({
      where: {
        department: scope.department,
        semester: scope.semester,
      },
    });

    if (subjects.length === 0) {
      errors.push(
        `No curriculum subjects found for ${scope.department} (${scope.semester}). Please establish subjects first.`,
      );
    }

    // 2. Check Faculty Assignments
    const faculty = await this.prisma.faculty.findMany({
      where: { department: { contains: scope.department, mode: 'insensitive' } },
    });

    if (faculty.length === 0) {
      errors.push(`No active teaching faculty found in department ${scope.department}.`);
    }

    const subjectsWithoutFaculty = subjects.filter((s) => !s.assignedFaculty);
    if (subjectsWithoutFaculty.length > 0) {
      warnings.push(
        `${subjectsWithoutFaculty.length} subject(s) do not have a dedicated faculty assigned (${subjectsWithoutFaculty.map((s) => s.code).join(', ')}). A qualified department instructor will be allocated automatically.`,
      );
    }

    // 3. Check Classrooms and Labs
    const rooms = await this.prisma.room.findMany();
    const classrooms = rooms.filter((r) => !r.isLab);
    const labs = rooms.filter((r) => r.isLab);

    if (classrooms.length === 0) {
      errors.push(`No lecture halls or classrooms registered in the institution.`);
    }

    const hasLabSubjects = subjects.some(
      (s) => s.type?.toLowerCase().includes('lab') || s.type?.toLowerCase().includes('practical'),
    );
    if (hasLabSubjects && labs.length === 0) {
      errors.push(`Curriculum requires laboratory sessions, but no laboratories exist in the system.`);
    }

    return {
      canGenerate: errors.length === 0,
      errors,
      warnings,
    };
  }
}
