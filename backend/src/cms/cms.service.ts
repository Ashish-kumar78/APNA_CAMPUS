import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // Notices
  async getNotices(search?: string, tag?: string) {
    const where: any = {};
    if (tag && tag !== 'ALL') {
      where.tag = tag.toUpperCase();
    }
    if (search) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.notice.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createNotice(data: { title: string; tag: string; pinned?: boolean; summary: string; content: string }, publisher: string) {
    return this.prisma.notice.create({
      data: {
        title: data.title.trim(),
        tag: data.tag.trim().toUpperCase(),
        pinned: Boolean(data.pinned),
        summary: data.summary.trim(),
        content: data.content.trim(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        publisher,
      },
    });
  }

  // Holidays
  async getHolidays() {
    return this.prisma.holiday.findMany({ orderBy: { daysLeft: 'asc' } });
  }

  // Blogs
  async getBlogs(tag?: string) {
    const where: any = {};
    if (tag && tag !== 'ALL') {
      where.tag = tag;
    }
    return this.prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBlog(data: { tag: string; title: string; body: string }, author: string, department: string) {
    const initials = author.split(' ').map((p) => p[0]).slice(0, 2).join('');
    return this.prisma.blogPost.create({
      data: {
        tag: data.tag.trim(),
        title: data.title.trim(),
        body: data.body.trim(),
        author,
        dept: department,
        initials,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    });
  }

  // Feedback Surveys
  async submitFeedback(data: { formType: string; targetId?: string; targetName?: string; rating: number; comments?: string; studentId?: string }) {
    return this.prisma.feedbackSurvey.create({
      data: {
        formType: data.formType.trim(),
        targetId: data.targetId,
        targetName: data.targetName,
        rating: Number(data.rating),
        comments: data.comments,
      },
    });
  }

  // Biometrics Turnstile
  async getBiometricLogs(direction?: string, studentId?: string) {
    const where: any = {};
    if (direction && direction !== 'ALL') where.direction = direction;
    if (studentId) where.studentId = studentId;
    return this.prisma.biometricLog.findMany({ where, orderBy: [{ date: 'desc' }, { time: 'desc' }] });
  }
}
