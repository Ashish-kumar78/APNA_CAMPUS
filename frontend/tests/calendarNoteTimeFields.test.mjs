import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  formatTime12h,
  formatEventTimeRange,
  sortNotesByTime,
  createCalendarNote,
  updateCalendarNote,
  getCalendarNotes,
  saveLocalNotesForUser,
  getLocalNotesForUser,
  getTodayIST
} from '../src/services/calendarNotesStore.js';

describe('Calendar Note Start Time & End Time Extension Suite', () => {
  const resolveSrc = (rel) => {
    if (fs.existsSync(path.resolve('src', rel))) return path.resolve('src', rel);
    if (fs.existsSync(path.resolve('frontend/src', rel))) return path.resolve('frontend/src', rel);
    return path.resolve(rel);
  };
  const resolveBackend = (rel) => {
    if (fs.existsSync(path.resolve('../backend', rel))) return path.resolve('../backend', rel);
    if (fs.existsSync(path.resolve('backend', rel))) return path.resolve('backend', rel);
    return path.resolve(rel);
  };
  const calendarWidgetJsx = fs.readFileSync(resolveSrc('components/CalendarWidget.jsx'), 'utf8');
  const schemaPrisma = fs.readFileSync(resolveBackend('prisma/schema.prisma'), 'utf8');
  const migrationSql = fs.readFileSync(
    resolveBackend('prisma/migrations/20261105110000_add_calendar_note_times/migration.sql'),
    'utf8'
  );
  const dtoTs = fs.readFileSync(resolveBackend('src/calendar-notes/calendar-notes.dto.ts'), 'utf8');
  const serviceTs = fs.readFileSync(resolveBackend('src/calendar-notes/calendar-notes.service.ts'), 'utf8');

  // Test Account
  const testAccount = { id: 'FAC_TIME_TEST', role: 'faculty', name: 'Dr. Test' };
  const todayStr = getTodayIST().dateStr;

  it('1. formatTime12h correctly formats 24h strings to 12h AM/PM strings', () => {
    expect(formatTime12h('09:00')).toBe('9:00 AM');
    expect(formatTime12h('10:30')).toBe('10:30 AM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
    expect(formatTime12h('13:45')).toBe('1:45 PM');
    expect(formatTime12h('00:00')).toBe('12:00 AM');
    expect(formatTime12h('23:59')).toBe('11:59 PM');
    expect(formatTime12h('')).toBe('');
    expect(formatTime12h(null)).toBe('');
  });

  it('2. formatEventTimeRange correctly handles both times, only start, and no times', () => {
    // Both times
    expect(formatEventTimeRange('10:00', '11:30')).toBe('10:00 AM - 11:30 AM');
    expect(formatEventTimeRange('09:15', '14:45')).toBe('9:15 AM - 2:45 PM');

    // Only start time
    expect(formatEventTimeRange('10:00', null)).toBe('10:00 AM');
    expect(formatEventTimeRange('10:00', '')).toBe('10:00 AM');

    // No time (both empty/null)
    expect(formatEventTimeRange(null, null)).toBe('');
    expect(formatEventTimeRange('', '')).toBe('');
    expect(formatEventTimeRange(null, '')).toBe('');
  });

  it('3. sortNotesByTime sorts notes on the same date by start time, notes without time at the end', () => {
    const notes = [
      { id: '1', scheduledDate: todayStr, title: 'No time note A', createdAt: '2026-11-05T08:00:00Z' },
      { id: '2', scheduledDate: todayStr, title: 'Afternoon session', startTime: '14:00', endTime: '15:30' },
      { id: '3', scheduledDate: todayStr, title: 'Morning lab', startTime: '09:00', endTime: '11:00' },
      { id: '4', scheduledDate: todayStr, title: 'Mid-day meeting', startTime: '11:30' },
      { id: '5', scheduledDate: todayStr, title: 'No time note B', createdAt: '2026-11-05T09:00:00Z' },
    ];

    const sorted = sortNotesByTime(notes);
    expect(sorted.map(n => n.id)).toEqual(['3', '4', '2', '1', '5']);
    expect(sorted[0].startTime).toBe('09:00');
    expect(sorted[1].startTime).toBe('11:30');
    expect(sorted[2].startTime).toBe('14:00');
    expect(sorted[3].startTime).toBeUndefined();
    expect(sorted[4].startTime).toBeUndefined();
  });

  it('4. Create note with no time, only start time, and both times', async () => {
    saveLocalNotesForUser(testAccount, []);

    // A: No time
    const noteNoTime = await createCalendarNote(testAccount, {
      title: 'Full Day Conference',
      scheduledDate: todayStr,
    });
    expect(noteNoTime.startTime).toBeNull();
    expect(noteNoTime.endTime).toBeNull();

    // B: Only start time
    const noteStartOnly = await createCalendarNote(testAccount, {
      title: 'Faculty Standup',
      scheduledDate: todayStr,
      startTime: '10:00',
    });
    expect(noteStartOnly.startTime).toBe('10:00');
    expect(noteStartOnly.endTime).toBeNull();

    // C: Both times
    const noteBothTimes = await createCalendarNote(testAccount, {
      title: 'Operating Systems Lecture',
      scheduledDate: todayStr,
      startTime: '11:00',
      endTime: '12:30',
    });
    expect(noteBothTimes.startTime).toBe('11:00');
    expect(noteBothTimes.endTime).toBe('12:30');

    // Retrieve and verify all notes saved
    const savedNotes = await getCalendarNotes(testAccount, todayStr);
    expect(savedNotes.length).toBe(3);
    // Verified sorted order: 10:00 first, 11:00 second, no time third
    expect(savedNotes[0].id).toBe(noteStartOnly.id);
    expect(savedNotes[1].id).toBe(noteBothTimes.id);
    expect(savedNotes[2].id).toBe(noteNoTime.id);
  });

  it('5. Validation: rejects invalid end time without start time or earlier than start time', async () => {
    saveLocalNotesForUser(testAccount, []);

    // End time entered but start time is empty
    await expect(
      createCalendarNote(testAccount, {
        title: 'Invalid End Only',
        scheduledDate: todayStr,
        startTime: null,
        endTime: '12:00',
      })
    ).rejects.toThrow('Please select a start time first.');

    // End time is earlier than start time
    await expect(
      createCalendarNote(testAccount, {
        title: 'Earlier End Time',
        scheduledDate: todayStr,
        startTime: '14:00',
        endTime: '13:00',
      })
    ).rejects.toThrow('End time must be after start time.');

    // End time is equal to start time
    await expect(
      createCalendarNote(testAccount, {
        title: 'Equal Times',
        scheduledDate: todayStr,
        startTime: '10:00',
        endTime: '10:00',
      })
    ).rejects.toThrow('End time must be after start time.');
  });

  it('6. Edit existing note allows updating times or removing them', async () => {
    saveLocalNotesForUser(testAccount, []);

    const original = await createCalendarNote(testAccount, {
      title: 'Lab Session',
      scheduledDate: todayStr,
      startTime: '09:00',
      endTime: '11:00',
    });

    // Update times
    const updated = await updateCalendarNote(testAccount, original.id, {
      startTime: '10:00',
      endTime: '12:00',
    });
    expect(updated.startTime).toBe('10:00');
    expect(updated.endTime).toBe('12:00');

    // Clear times
    const cleared = await updateCalendarNote(testAccount, original.id, {
      startTime: null,
      endTime: null,
    });
    expect(cleared.startTime).toBeNull();
    expect(cleared.endTime).toBeNull();
  });

  it('7. Backward compatibility: existing notes without times load without errors', async () => {
    // Simulate legacy note in localStorage without startTime / endTime
    const legacyNotes = [
      {
        id: 'legacy-note-001',
        userId: 'fac_time_test',
        title: 'Legacy Board Review',
        description: 'No times specified in legacy data',
        scheduledDate: todayStr,
        status: 'PENDING',
        createdAt: '2026-10-01T10:00:00Z',
      }
    ];
    saveLocalNotesForUser(testAccount, legacyNotes);

    const loaded = await getCalendarNotes(testAccount);
    expect(loaded.length).toBe(1);
    expect(loaded[0].title).toBe('Legacy Board Review');
    expect(formatEventTimeRange(loaded[0].startTime, loaded[0].endTime)).toBe('');
  });

  it('8. UI Verification in CalendarWidget: fields, layout, and scroll container', () => {
    // Config flag exists
    expect(calendarWidgetJsx).toContain('const REQUIRE_START_TIME = false');

    // Form states exist
    expect(calendarWidgetJsx).toContain('formStartTime');
    expect(calendarWidgetJsx).toContain('formEndTime');
    expect(calendarWidgetJsx).toContain('timeError');

    // Input type="time" fields exist
    expect(calendarWidgetJsx).toContain('type="time"');
    expect(calendarWidgetJsx).toContain('Start Time');
    expect(calendarWidgetJsx).toContain('End Time');
    expect(calendarWidgetJsx).toContain('(Optional)');

    // Responsive 2-column grid layout
    expect(calendarWidgetJsx).toContain("gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))'");

    // Error messages
    expect(calendarWidgetJsx).toContain('Please select a start time first.');
    expect(calendarWidgetJsx).toContain('End time must be after start time.');

    // Modal scroll bounds: max-height: 90dvh and overflow-y: auto
    expect(calendarWidgetJsx).toContain("maxHeight: '90dvh'");
    expect(calendarWidgetJsx).toContain("overflowY: 'auto'");

    // Time display in notes list
    expect(calendarWidgetJsx).toContain('formatEventTimeRange(note.startTime, note.endTime)');
  });

  it('9. Backend Prisma schema, migration, DTO and service support startTime and endTime', () => {
    // Prisma Schema
    expect(schemaPrisma).toContain('startTime     String?   @map("start_time")');
    expect(schemaPrisma).toContain('endTime       String?   @map("end_time")');

    // Migration SQL
    expect(migrationSql).toContain('ALTER TABLE "calendar_notes" ADD COLUMN IF NOT EXISTS "start_time" TEXT');
    expect(migrationSql).toContain('ALTER TABLE "calendar_notes" ADD COLUMN IF NOT EXISTS "end_time" TEXT');

    // DTO
    expect(dtoTs).toContain('startTime?: string;');
    expect(dtoTs).toContain('endTime?: string;');

    // Service
    expect(serviceTs).toContain('startTime?: string | null;');
    expect(serviceTs).toContain('endTime?: string | null;');
    expect(serviceTs).toContain('Please select a start time first.');
    expect(serviceTs).toContain('End time must be after start time.');
  });

  it('10. AM / PM selection controls and 12h-to-24h parsing integration', () => {
    // 12-hour AM/PM TimePicker component exists
    expect(calendarWidgetJsx).toContain('TimePicker12h');
    expect(calendarWidgetJsx).toContain('parse24to12');
    expect(calendarWidgetJsx).toContain('format12to24');

    // AM and PM buttons
    expect(calendarWidgetJsx).toMatch(/>\s*AM\s*<\/button>/);
    expect(calendarWidgetJsx).toMatch(/>\s*PM\s*<\/button>/);

    // Hours (01-12) and Minutes (00-55) options
    expect(calendarWidgetJsx).toContain('HOURS_12');
    expect(calendarWidgetJsx).toContain('MINUTES_5');
  });
});

