import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FILE_DATA_LENGTH = 15 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

@Injectable()
export class ClassNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getVerifiedNotes(filters: {
    subject?: string;
    date?: string;
    search?: string;
    materialType?: string;
    section?: string;
    semester?: string;
  }) {
    const where: any = {
      status: { in: ['VERIFIED', 'PUBLISHED', 'VISIBLE'] },
    };
    if (filters.subject && filters.subject !== 'ALL') {
      where.subject = { equals: filters.subject, mode: 'insensitive' };
    }
    if (filters.date) where.lectureDate = filters.date;
    if (filters.section && filters.section !== 'ALL') {
      const cleanSec = filters.section.replace(/^Section\s+/i, '').trim();
      where.OR = [
        { section: { equals: filters.section, mode: 'insensitive' } },
        { section: { equals: `Section ${cleanSec}`, mode: 'insensitive' } },
        { section: { equals: cleanSec, mode: 'insensitive' } },
        { section: 'ALL' },
      ];
    }
    if (filters.semester && filters.semester !== 'ALL') {
      where.semester = { contains: filters.semester, mode: 'insensitive' };
    }
    if (filters.search) {
      const searchCondition = [
        { topic: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { fileName: { contains: filters.search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchCondition }];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    const notes = await this.prisma.classNote.findMany({
      where,
      include: { student: { select: { name: true, rollNumber: true, department: true } } },
      orderBy: { verifiedAt: 'desc' },
    });

    return notes.map((note) => ({
      id: note.id,
      subject: note.subject,
      subjectCode: note.subjectCode,
      date: note.lectureDate,
      topic: note.topic,
      description: note.description || '',
      semester: note.semester,
      section: note.section,
      materialType: 'Lecture Notes',
      uploadedBy: {
        name: note.student.name,
        rollNumber: note.student.rollNumber,
        department: note.student.department,
      },
      uploadedAt: note.createdAt,
      fileUrl: note.fileData,
      fileName: note.fileName,
      fileType: note.fileType,
      status: 'VISIBLE',
      isFacultyVerified: true,
      verifiedBy: note.verifiedBy,
      reports: [],
    }));
  }

  async uploadNote(identifier: string, payload: any) {
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [
          { userId: identifier },
          { rollNumber: identifier },
          { studentId: identifier },
        ],
      },
    });
    if (!student) throw new NotFoundException('Student profile not found.');

    const fileData = payload.previewUrl || payload.fileUrl;
    const fileType = String(payload.fileType || '').toLowerCase();
    if (!fileData || typeof fileData !== 'string' || fileData.length > MAX_FILE_DATA_LENGTH) {
      throw new BadRequestException('Attach a file smaller than 10 MB before submitting notes.');
    }
    if (!ALLOWED_FILE_TYPES.has(fileType)) {
      throw new BadRequestException('Only PDF, JPEG, PNG, and WEBP class notes are supported.');
    }
    if (!String(payload.topic || '').trim() || !String(payload.subject || '').trim()) {
      throw new BadRequestException('Subject and topic are required to submit class notes.');
    }
    if (!fileData.startsWith(`data:${fileType};base64,`)) {
      throw new BadRequestException('The uploaded file data is invalid.');
    }

    const note = await this.prisma.classNote.create({
      data: {
        studentId: student.id,
        subject: String(payload.subject).trim(),
        subjectCode: payload.subjectCode ? String(payload.subjectCode).trim() : null,
        lectureDate: String(payload.date || new Date().toISOString().slice(0, 10)),
        topic: String(payload.topic).trim(),
        description: String(payload.description || '').trim() || null,
        semester: student.semester,
        section: student.section,
        fileData,
        fileName: String(payload.fileName || 'class-notes'),
        fileType,
        status: 'VERIFIED',
      },
      include: { student: { select: { name: true, rollNumber: true } } },
    });

    return {
      id: note.id,
      subject: note.subject,
      date: note.lectureDate,
      topic: note.topic,
      description: note.description || '',
      semester: note.semester,
      section: note.section,
      uploadedBy: { name: note.student.name, rollNumber: note.student.rollNumber },
      uploadedAt: note.createdAt,
      fileUrl: note.fileData,
      fileName: note.fileName,
      fileType: note.fileType,
      status: note.status,
      isFacultyVerified: false,
    };
  }

  async getPendingNotes(department?: string) {
    return this.prisma.classNote.findMany({
      where: {
        status: 'PENDING',
        ...(department ? { student: { department: { equals: department, mode: 'insensitive' } } } : {}),
      },
      include: {
        student: {
          select: { name: true, rollNumber: true, department: true, semester: true, section: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewNote(
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    reviewer: string,
    department?: string,
    remarks?: string,
  ) {
    const note = await this.prisma.classNote.findUnique({
      where: { id },
      include: { student: { select: { department: true } } },
    });
    if (!note) throw new NotFoundException('Class note not found.');
    if (note.status !== 'PENDING') {
      throw new BadRequestException('This class note has already been reviewed.');
    }
    if (
      department &&
      note.student.department.toLowerCase() !== department.toLowerCase()
    ) {
      throw new ForbiddenException('You can only review notes from your own department.');
    }

    return this.prisma.classNote.update({
      where: { id },
      data: {
        status,
        verifiedBy: reviewer,
        verifiedAt: new Date(),
        reviewerRemarks: remarks?.trim() || null,
      },
    });
  }
}
