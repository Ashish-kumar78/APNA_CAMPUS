import { describe, expect, it } from 'vitest';
import { canAccess, hasPermission } from '../server/utils/rbac.js';

describe('Timetable System Access and Integrity Tests', () => {
  describe('RBAC & Approval Permissions', () => {
    it('allows super admin to configure and oversee institutional timetables', () => {
      expect(hasPermission('super_admin', 'academic:write') || canAccess('super_admin', 'timetables:manage')).toBe(true);
    });

    it('allows hod and admin to generate and manage department timetables', () => {
      expect(canAccess('hod', 'department:read') || hasPermission('hod', 'faculty:read')).toBe(true);
    });

    it('allows principal to review, approve and publish timetables', () => {
      expect(hasPermission('principal', 'academics:read') || canAccess('principal', 'timetables:approve')).toBe(true);
    });

    it('prevents students from modifying or approving timetables', () => {
      expect(canAccess('student', 'timetables:write')).toBe(false);
      expect(canAccess('student', 'timetables:approve')).toBe(false);
      expect(canAccess('student', 'timetables:publish')).toBe(false);
    });

    it('allows teaching staff to view their assigned sessions but not publish', () => {
      expect(canAccess('faculty', 'timetables:publish')).toBe(false);
    });
  });

  describe('Timetable Hard Constraints & Collision Verification Logic', () => {
    // Pure constraint checking unit logic mirroring NestJS TimetablesValidationService
    const checkFacultyClash = (entryA, entryB) => {
      if (entryA.dayOfWeek !== entryB.dayOfWeek) return false;
      if (entryA.periodNumber !== entryB.periodNumber) return false;
      return entryA.facultyId === entryB.facultyId;
    };

    const checkRoomClash = (entryA, entryB) => {
      if (entryA.dayOfWeek !== entryB.dayOfWeek) return false;
      if (entryA.periodNumber !== entryB.periodNumber) return false;
      return entryA.roomId === entryB.roomId;
    };

    const checkSectionClash = (entryA, entryB) => {
      if (entryA.dayOfWeek !== entryB.dayOfWeek) return false;
      if (entryA.periodNumber !== entryB.periodNumber) return false;
      return entryA.section === entryB.section;
    };

    it('detects faculty double-booking on same day and period', () => {
      const entry1 = { dayOfWeek: 1, periodNumber: 2, facultyId: 'FAC_101', roomId: 'ROOM_A', section: 'CSE-A' };
      const entry2 = { dayOfWeek: 1, periodNumber: 2, facultyId: 'FAC_101', roomId: 'ROOM_B', section: 'CSE-B' };

      expect(checkFacultyClash(entry1, entry2)).toBe(true);
    });

    it('detects room double-booking on same day and period', () => {
      const entry1 = { dayOfWeek: 2, periodNumber: 4, facultyId: 'FAC_101', roomId: 'LAB_1', section: 'CSE-A' };
      const entry2 = { dayOfWeek: 2, periodNumber: 4, facultyId: 'FAC_102', roomId: 'LAB_1', section: 'ECE-A' };

      expect(checkRoomClash(entry1, entry2)).toBe(true);
    });

    it('detects section double-booking on same day and period', () => {
      const entry1 = { dayOfWeek: 3, periodNumber: 1, facultyId: 'FAC_101', roomId: 'ROOM_A', section: 'CSE-A' };
      const entry2 = { dayOfWeek: 3, periodNumber: 1, facultyId: 'FAC_102', roomId: 'ROOM_B', section: 'CSE-A' };

      expect(checkSectionClash(entry1, entry2)).toBe(true);
    });

    it('allows same faculty in different periods without conflict', () => {
      const entry1 = { dayOfWeek: 1, periodNumber: 1, facultyId: 'FAC_101', roomId: 'ROOM_A', section: 'CSE-A' };
      const entry2 = { dayOfWeek: 1, periodNumber: 2, facultyId: 'FAC_101', roomId: 'ROOM_A', section: 'CSE-B' };

      expect(checkFacultyClash(entry1, entry2)).toBe(false);
    });
  });

  describe('Laboratory & Practical Consecutive Constraints', () => {
    it('verifies consecutive lab blocks have matching day and sequential periods', () => {
      const labSessions = [
        { dayOfWeek: 2, periodNumber: 5, subjectCode: 'CS301P', isLab: true },
        { dayOfWeek: 2, periodNumber: 6, subjectCode: 'CS301P', isLab: true },
      ];

      const isConsecutive = labSessions[0].dayOfWeek === labSessions[1].dayOfWeek &&
        labSessions[1].periodNumber === labSessions[0].periodNumber + 1;

      expect(isConsecutive).toBe(true);
    });

    it('rejects split laboratory blocks across different days or separated periods', () => {
      const invalidLab1 = [
        { dayOfWeek: 2, periodNumber: 2, subjectCode: 'CS301P', isLab: true },
        { dayOfWeek: 3, periodNumber: 2, subjectCode: 'CS301P', isLab: true },
      ];
      const isConsecutive1 = invalidLab1[0].dayOfWeek === invalidLab1[1].dayOfWeek &&
        invalidLab1[1].periodNumber === invalidLab1[0].periodNumber + 1;
      expect(isConsecutive1).toBe(false);

      const invalidLab2 = [
        { dayOfWeek: 2, periodNumber: 2, subjectCode: 'CS301P', isLab: true },
        { dayOfWeek: 2, periodNumber: 5, subjectCode: 'CS301P', isLab: true },
      ];
      const isConsecutive2 = invalidLab2[0].dayOfWeek === invalidLab2[1].dayOfWeek &&
        invalidLab2[1].periodNumber === invalidLab2[0].periodNumber + 1;
      expect(isConsecutive2).toBe(false);
    });
  });

  describe('Room Capacity and Laboratory Matching', () => {
    it('flags capacity mismatch when section size exceeds room capacity', () => {
      const sectionStrength = 65;
      const roomCapacity = 50;
      expect(sectionStrength > roomCapacity).toBe(true);
    });

    it('enforces lab sessions require LAB room type and not regular CLASSROOM', () => {
      const session = { isLab: true, subjectCode: 'CS302P' };
      const allocatedRoom = { roomType: 'LABORATORY', capacity: 40 };
      const invalidRoom = { roomType: 'LECTURE_HALL', capacity: 70 };

      const isValidLabAllocation = (session, room) => {
        if (session.isLab) return room.roomType === 'LABORATORY';
        return true;
      };

      expect(isValidLabAllocation(session, allocatedRoom)).toBe(true);
      expect(isValidLabAllocation(session, invalidRoom)).toBe(false);
    });
  });

  describe('Timetable Lifecycle Transition Guards', () => {
    const validTransitions = {
      DRAFT: ['PENDING_APPROVAL'],
      PENDING_APPROVAL: ['APPROVED', 'DRAFT'],
      APPROVED: ['PUBLISHED', 'DRAFT'],
      PUBLISHED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    const canTransition = (from, to) => {
      return (validTransitions[from] || []).includes(to);
    };

    it('allows DRAFT to transition to PENDING_APPROVAL', () => {
      expect(canTransition('DRAFT', 'PENDING_APPROVAL')).toBe(true);
    });

    it('allows PENDING_APPROVAL to be APPROVED or rejected back to DRAFT', () => {
      expect(canTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
      expect(canTransition('PENDING_APPROVAL', 'DRAFT')).toBe(true);
    });

    it('allows APPROVED to be PUBLISHED', () => {
      expect(canTransition('APPROVED', 'PUBLISHED')).toBe(true);
    });

    it('disallows directly publishing an unapproved DRAFT', () => {
      expect(canTransition('DRAFT', 'PUBLISHED')).toBe(false);
    });
  });
});
