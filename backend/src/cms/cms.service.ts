import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationEventType, NotificationPriority } from '../notifications/notification-events';
import { Role } from '@prisma/client';

@Injectable()
export class CmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

  async createNotice(data: {
    title: string;
    tag: string;
    publisher?: string;
    pinned?: boolean;
    summary: string;
    content: string;
    department?: string;
    semester?: string;
  }) {
    const notice = await this.prisma.notice.create({
      data: {
        title: data.title,
        tag: data.tag,
        publisher: data.publisher || 'Dean Office',
        pinned: data.pinned ?? false,
        summary: data.summary,
        content: data.content,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    });

    // Determine category and priority from tag
    const tagUpper = (data.tag || '').toUpperCase();
    let category: any = NotificationCategory.CAMPUS;
    let priority: any = NotificationPriority.NORMAL;
    if (tagUpper === 'EXAM' || tagUpper === 'ACADEMIC') {
      category = NotificationCategory.ACADEMIC;
    } else if (tagUpper === 'ADMIN' || tagUpper === 'POLICY') {
      category = NotificationCategory.ADMIN;
    } else if (tagUpper === 'URGENT') {
      priority = NotificationPriority.URGENT;
    }


    // Dispatch notification to target audience
    try {
      await this.notificationsService.dispatch({
        eventType: NotificationEventType.ANNOUNCEMENT_PUBLISHED,
        title: data.title,
        message: data.summary || data.content.slice(0, 160),
        category,
        priority: data.pinned ? NotificationPriority.HIGH : priority,
        sourceModule: 'Campus Connect',
        senderName: data.publisher || 'Dean Office',
        senderRole: 'ADMIN',
        actionUrl: '/cms',
        actionTab: 'notices',
        actionLabel: 'Read Circular',
        target: {
          department: data.department,
          semester: data.semester,
        },
        dedupKey: `cms-notice-${notice.id}`,
      });
    } catch {
      // Non-blocking
    }

    return notice;
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

  async createBlog(data: { author: string; dept: string; tag: string; title: string; body: string }) {
    const initials = data.author.split(' ').map((p) => p[0]).slice(0, 2).join('');
    return this.prisma.blogPost.create({
      data: {
        ...data,
        initials,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    });
  }

  async toggleLikeBlog(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) return null;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        liked: !post.liked,
        likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1,
      },
    });
  }

  // Feedback Surveys
  async submitFeedback(data: { formType: string; targetId?: string; targetName?: string; rating: number; comments?: string; studentId?: string }) {
    return this.prisma.feedbackSurvey.create({
      data: {
        ...data,
        rating: Number(data.rating),
      },
    });
  }

  // Biometrics Turnstile
  async getBiometricLogs(direction?: string) {
    return [
      { id: 1, date: '02 Oct 2026', time: '08:42 AM', point: 'Campus Main Gate (Turnstile 02)', mode: 'RFID Tap', direction: 'IN', status: 'Authorized' },
      { id: 2, date: '02 Oct 2026', time: '09:05 AM', point: 'Academic Block 3 - CSE Wing', mode: 'Fingerprint', direction: 'IN', status: 'Authorized' },
      { id: 3, date: '02 Oct 2026', time: '01:15 PM', point: 'Central Canteen Turnstile', mode: 'Facial Rec.', direction: 'IN', status: 'Authorized' },
      { id: 4, date: '02 Oct 2026', time: '01:50 PM', point: 'Central Library Turnstile', mode: 'RFID Tap', direction: 'IN', status: 'Authorized' },
      { id: 5, date: '02 Oct 2026', time: '05:20 PM', point: 'Campus Main Gate (Turnstile 01)', mode: 'RFID Tap', direction: 'OUT', status: 'Authorized' },
      { id: 6, date: '02 Oct 2026', time: '07:45 PM', point: 'Hostel Block C Entry Turnstile', mode: 'Fingerprint', direction: 'IN', status: 'In before curfew' },
      { id: 7, date: '01 Oct 2026', time: '08:50 AM', point: 'Campus Main Gate', mode: 'RFID Tap', direction: 'IN', status: 'Authorized' },
      { id: 8, date: '01 Oct 2026', time: '05:10 PM', point: 'Campus Main Gate', mode: 'RFID Tap', direction: 'OUT', status: 'Authorized' },
    ].filter((log) => !direction || direction === 'ALL' || log.direction === direction);
  }
}
