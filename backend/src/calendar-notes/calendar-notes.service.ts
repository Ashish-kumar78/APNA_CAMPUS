import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarNoteDto, UpdateCalendarNoteDto } from './calendar-notes.dto';
import * as fs from 'fs';
import * as path from 'path';

export interface CalendarNoteRecord {
  id: string;
  userId: string;
  userRole?: string;
  userEmail?: string;
  userName?: string;
  title: string;
  description?: string;
  scheduledDate: string; // 'YYYY-MM-DD'
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CalendarNotesService {
  private readonly logger = new Logger(CalendarNotesService.name);
  private memoryStore: Map<string, CalendarNoteRecord> = new Map();
  private dataFilePath: string;

  constructor(private readonly prisma: PrismaService) {
    const rootDir = process.cwd().endsWith('backend') ? process.cwd() : path.join(process.cwd(), 'backend');
    this.dataFilePath = path.resolve(rootDir, 'data', 'calendar_notes_store.json');
    this.loadFallbackStore();
  }

  private loadFallbackStore() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const list: CalendarNoteRecord[] = JSON.parse(raw);
        for (const item of list) {
          this.memoryStore.set(item.id, item);
        }
      }
    } catch (e: any) {
      this.logger.warn(`Could not load local calendar notes file store: ${e?.message}`);
    }
  }

  private persistFallbackStore() {
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.memoryStore.values());
      fs.writeFileSync(this.dataFilePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (e: any) {
      this.logger.warn(`Could not persist local calendar notes file store: ${e?.message}`);
    }
  }

  /**
   * Resolves standard user identifier from User object or headers
   */
  getTodayIST(): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  }

  resolveUserId(user: any): string {
    if (!user) return 'anonymous-user';
    return String(user.id || user.identifier || user.email || user.role || 'user').trim().toLowerCase();
  }

  /**
   * 1. Get notes for authenticated user, with optional date or month filtering
   */
  /**
   * Get single calendar note by ID with ownership verification
   */
  async getNoteById(user: any, id: string): Promise<CalendarNoteRecord> {
    const userId = this.resolveUserId(user);
    try {
      const row = await (this.prisma as any).calendarNote.findUnique({ where: { id } });
      if (row) {
        if (row.userId !== userId && user?.role !== 'SUPER_ADMIN' && user?.role !== 'super_admin') {
          throw new ForbiddenException('Access to this private calendar note is denied.');
        }
        return {
          ...row,
          completedAt: row.completedAt ? row.completedAt.toISOString() : null,
          createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
        };
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
    }

    const mem = this.memoryStore.get(id);
    if (!mem) throw new NotFoundException(`Calendar note ${id} not found.`);
    if (mem.userId !== userId && user?.role !== 'SUPER_ADMIN' && user?.role !== 'super_admin') {
      throw new ForbiddenException('Access to this private calendar note is denied.');
    }
    return mem;
  }

    async getNotes(user: any, filterDate?: string, filterMonth?: string): Promise<CalendarNoteRecord[]> {
    const userId = this.resolveUserId(user);

    try {
      const whereClause: any = { userId };
      if (filterDate) {
        whereClause.scheduledDate = filterDate;
      } else if (filterMonth) {
        whereClause.scheduledDate = { startsWith: filterMonth };
      }

      const rows = await (this.prisma as any).calendarNote.findMany({
        where: whereClause,
        orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'asc' }],
      });

      if (rows && rows.length > 0) {
        // Sync to fallback memory
        for (const r of rows) {
          this.memoryStore.set(r.id, {
            ...r,
            completedAt: r.completedAt ? r.completedAt.toISOString() : null,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          });
        }
        return rows.map((r: any) => ({
          ...r,
          completedAt: r.completedAt ? r.completedAt.toISOString() : null,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      this.logger.debug(`Prisma calendarNote query fallback: ${err?.message}`);
    }

    // In-memory / file fallback
    let results = Array.from(this.memoryStore.values()).filter((n) => n.userId === userId);
    if (filterDate) {
      results = results.filter((n) => n.scheduledDate === filterDate);
    } else if (filterMonth) {
      results = results.filter((n) => n.scheduledDate.startsWith(filterMonth));
    }
    return results.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }

  /**
   * 2. Mandatory Reminder Retrieval:
   * Returns all notes for this user that are PENDING and scheduled on or before todayDateStr.
   * Includes today's notes AND all previous overdue unsubmitted notes.
   */
  async getPendingReminders(user: any, currentDateStr?: string): Promise<CalendarNoteRecord[]> {
    const userId = this.resolveUserId(user);
    const todayStr = currentDateStr || this.getTodayIST();

    try {
      const rows = await (this.prisma as any).calendarNote.findMany({
        where: {
          userId,
          status: 'PENDING',
          scheduledDate: { lte: todayStr },
        },
        orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'asc' }],
      });

      if (rows) {
        return rows.map((r: any) => ({
          ...r,
          completedAt: r.completedAt ? r.completedAt.toISOString() : null,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      this.logger.debug(`Prisma pending reminders query fallback: ${err?.message}`);
    }

    // Memory / fallback store
    const list = Array.from(this.memoryStore.values()).filter(
      (n) => n.userId === userId && n.status === 'PENDING' && n.scheduledDate <= todayStr,
    );
    return list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }

  /**
   * 3. Create Note (strictly tied to authenticated user)
   */
  async createNote(user: any, dto: CreateCalendarNoteDto): Promise<CalendarNoteRecord> {
    const userId = this.resolveUserId(user);
    const todayIST = this.getTodayIST();
    if (dto.scheduledDate < todayIST) {
      throw new BadRequestException(`Cannot create notes for past dates (Scheduled: , Current IST: )`);
    }
    const id = `cn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const record: CalendarNoteRecord = {
      id,
      userId,
      userRole: user?.role ? String(user.role).toLowerCase() : undefined,
      userEmail: user?.email || undefined,
      userName: user?.name || user?.displayName || undefined,
      title: dto.title.trim(),
      description: dto.description ? dto.description.trim() : '',
      scheduledDate: dto.scheduledDate.trim(),
      status: 'PENDING',
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      const created = await (this.prisma as any).calendarNote.create({
        data: {
          id: record.id,
          userId: record.userId,
          userRole: record.userRole,
          userEmail: record.userEmail,
          userName: record.userName,
          title: record.title,
          description: record.description,
          scheduledDate: record.scheduledDate,
          status: 'PENDING',
        },
      });
      if (created) {
        this.memoryStore.set(record.id, record);
        this.persistFallbackStore();
        return {
          ...created,
          completedAt: null,
          createdAt: created.createdAt ? created.createdAt.toISOString() : nowIso,
          updatedAt: created.updatedAt ? created.updatedAt.toISOString() : nowIso,
        };
      }
    } catch (err: any) {
      this.logger.debug(`Prisma calendarNote create fallback: ${err?.message}`);
    }

    this.memoryStore.set(record.id, record);
    this.persistFallbackStore();
    return record;
  }

  /**
   * 4. Update Note (validates user ownership)
   */
  async updateNote(user: any, noteId: string, dto: UpdateCalendarNoteDto): Promise<CalendarNoteRecord> {
    const userId = this.resolveUserId(user);
    const existing = await this.findNoteById(noteId);

    if (!existing) {
      throw new NotFoundException(`Calendar note ${noteId} not found`);
    }

    // STRICT OWNERSHIP CHECK: Users can only edit their own notes
    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied: You cannot edit notes belonging to another user');
    }

    if (dto.scheduledDate) {
      const todayIST = this.getTodayIST();
      if (dto.scheduledDate < todayIST) {
        throw new BadRequestException(`Cannot update note to a past date (Scheduled: , Current IST: )`);
      }
    }

    const updatedData: Partial<CalendarNoteRecord> = {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.scheduledDate !== undefined && { scheduledDate: dto.scheduledDate.trim() }),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await (this.prisma as any).calendarNote.update({
        where: { id: noteId },
        data: updatedData,
      });
      if (res) {
        const merged = { ...existing, ...updatedData };
        this.memoryStore.set(noteId, merged as CalendarNoteRecord);
        this.persistFallbackStore();
        return {
          ...res,
          completedAt: res.completedAt ? res.completedAt.toISOString() : null,
          createdAt: res.createdAt ? res.createdAt.toISOString() : existing.createdAt,
          updatedAt: res.updatedAt ? res.updatedAt.toISOString() : new Date().toISOString(),
        };
      }
    } catch (err: any) {
      this.logger.debug(`Prisma update calendarNote fallback: ${err?.message}`);
    }

    const merged: CalendarNoteRecord = {
      ...existing,
      ...updatedData,
    };
    this.memoryStore.set(noteId, merged);
    this.persistFallbackStore();
    return merged;
  }

  /**
   * 5. Submit Note (marks as COMPLETED, removes from pending reminders)
   */
  async submitNote(user: any, noteId: string): Promise<CalendarNoteRecord> {
    const userId = this.resolveUserId(user);
    const existing = await this.findNoteById(noteId);

    if (!existing) {
      throw new NotFoundException(`Calendar note ${noteId} not found`);
    }

    // STRICT OWNERSHIP CHECK
    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied: You cannot submit notes belonging to another user');
    }

    const completedAtIso = new Date().toISOString();

    try {
      const res = await (this.prisma as any).calendarNote.update({
        where: { id: noteId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
      if (res) {
        const updated = {
          ...existing,
          status: 'COMPLETED' as const,
          completedAt: completedAtIso,
          updatedAt: completedAtIso,
        };
        this.memoryStore.set(noteId, updated);
        this.persistFallbackStore();
        return updated;
      }
    } catch (err: any) {
      this.logger.debug(`Prisma submit calendarNote fallback: ${err?.message}`);
    }

    const updated: CalendarNoteRecord = {
      ...existing,
      status: 'COMPLETED',
      completedAt: completedAtIso,
      updatedAt: completedAtIso,
    };
    this.memoryStore.set(noteId, updated);
    this.persistFallbackStore();
    return updated;
  }

  /**
   * 6. Delete Note (validates user ownership)
   */
  async deleteNote(user: any, noteId: string): Promise<{ success: boolean; id: string }> {
    const userId = this.resolveUserId(user);
    const existing = await this.findNoteById(noteId);

    if (!existing) {
      throw new NotFoundException(`Calendar note ${noteId} not found`);
    }

    // STRICT OWNERSHIP CHECK
    if (existing.userId !== userId) {
      throw new ForbiddenException('Access denied: You cannot delete notes belonging to another user');
    }

    try {
      await (this.prisma as any).calendarNote.delete({
        where: { id: noteId },
      });
    } catch (err: any) {
      this.logger.debug(`Prisma delete calendarNote fallback: ${err?.message}`);
    }

    this.memoryStore.delete(noteId);
    this.persistFallbackStore();
    return { success: true, id: noteId };
  }

  private async findNoteById(id: string): Promise<CalendarNoteRecord | null> {
    try {
      const found = await (this.prisma as any).calendarNote.findUnique({
        where: { id },
      });
      if (found) {
        return {
          ...found,
          completedAt: found.completedAt ? found.completedAt.toISOString() : null,
          createdAt: found.createdAt.toISOString(),
          updatedAt: found.updatedAt.toISOString(),
        };
      }
    } catch (e: any) {
      // ignore
    }
    return this.memoryStore.get(id) || null;
  }
}
