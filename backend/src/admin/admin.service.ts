import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly accountRoleRank: Partial<Record<Role, number>> = {
    [Role.SUPER_ADMIN]: 100,
    [Role.MANAGEMENT]: 90,
    [Role.PRINCIPAL]: 80,
    [Role.ADMIN]: 70,
    [Role.HOD]: 60,
    [Role.FACULTY]: 50,
    [Role.EXAM_CELL]: 40,
    [Role.ACCOUNTS]: 40,
    [Role.LIBRARY]: 40,
    [Role.PLACEMENT]: 40,
    [Role.TRANSPORT]: 40,
    [Role.HOSTEL]: 40,
    [Role.WARDEN]: 40,
    [Role.STAFF]: 40,
    [Role.CANTEEN]: 40,
    [Role.ADMISSIONS]: 40,
    [Role.MAINTENANCE]: 40,
    [Role.NON_TEACHING]: 40,
    [Role.STUDENT]: 10,
  };

  private assertActorCanManageRole(actorRole: unknown, targetRole: Role, action: string) {
    const actorKey = String(actorRole || '').toUpperCase() as Role;
    const actorRank = this.accountRoleRank[actorKey];
    const targetRank = this.accountRoleRank[targetRole];
    if (actorRank === undefined || targetRank === undefined || actorRank <= targetRank) {
      throw new ForbiddenException(`You cannot ${action} an account with an equal or higher role. Only a higher-privilege role may manage this account.`);
    }
  }

  async getAiModelMetrics() {
    const baseUrl = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/metrics`, {
        signal: AbortSignal.timeout(3500),
      });
      if (!response.ok) {
        throw new Error(`AI metrics endpoint returned HTTP ${response.status}`);
      }
      return await response.json();
    } catch {
      throw new ServiceUnavailableException('AI model metrics are currently unavailable.');
    }
  }

  async getMetrics() {
    const startDb = Date.now();
    let dbLatencyMs: number | null = null;
    let systemStatus = 'Degraded';
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      dbLatencyMs = Date.now() - startDb;
      systemStatus = 'Operational';
    } catch {
      dbLatencyMs = Date.now() - startDb;
    }

    const totalStudents = await this.prisma.student.count();
    const totalFaculty = await this.prisma.user.count({ where: { role: 'FACULTY' } });
    const programsCount = await this.prisma.department.count();

    // Staff & Account Statuses
    const totalStaff = await this.prisma.user.count({
      where: {
        role: {
          in: ['STAFF', 'WARDEN', 'CANTEEN', 'TRANSPORT', 'MAINTENANCE', 'ACCOUNTS', 'LIBRARY', 'EXAM_CELL', 'PLACEMENT', 'ADMIN', 'HOD'],
        },
      },
    });

    const activeUsers = await this.prisma.user.count({ where: { isActive: true } });
    const inactiveUsers = await this.prisma.user.count({ where: { isActive: false } });

    // Audit logs stats
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const auditEventsTotal = await this.prisma.auditLog.count();
    const auditEvents30Days = await this.prisma.auditLog.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // The User collection is the source of truth for accounts, including
    // Super Admin and operational roles that aren't represented in those counts.
    const totalRegisteredAccounts = await this.prisma.user.count();
    const groupedUserCounts = await this.prisma.user.groupBy({
      by: ['role', 'isActive'],
      _count: { _all: true },
    });
    const userRoleCounts: Record<string, { active: number; suspended: number }> = {};
    for (const role of Object.values(Role)) {
      userRoleCounts[role.toLowerCase()] = { active: 0, suspended: 0 };
    }
    for (const group of groupedUserCounts) {
      const counts = userRoleCounts[group.role.toLowerCase()];
      if (counts) {
        if (group.isActive) counts.active = group._count._all;
        else counts.suspended = group._count._all;
      }
    }

    return {
      totalStudents,
      totalFaculty,
      totalStaff,
      totalAccounts: totalRegisteredAccounts,
      activeAccounts: activeUsers,
      inactiveAccounts: inactiveUsers,
      suspendedAccounts: inactiveUsers,
      userRoleCounts,
      programsCount,
      attendancePercentage: null,
      feesCollected: null,
      pendingDues: null,
      activeHostelResidents: await this.prisma.student.count({ where: { hostelName: { not: null } } }),
      placementOffers: null,
      auditEventsTotal,
      auditEvents30Days,
      managedRolesCount: null,
      granularPoliciesCount: null,
      systemStatus,
      dbLatencyMs,
      uptimeSeconds: Math.floor(process.uptime()),
      lastUpdated: new Date().toISOString(),
    };
  }

  // Diagnostics check
  async getDiagnostics() {
    const startDb = Date.now();
    let dbStatus = 'Operational';
    let dbLatencyMs: number | null = null;
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      dbLatencyMs = Date.now() - startDb;
    } catch {
      dbStatus = 'Degraded';
      dbLatencyMs = Date.now() - startDb;
    }

    const memory = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());

    return {
      timestamp: new Date().toISOString(),
      overallStatus: dbStatus === 'Operational' ? 'Nominal' : 'Degraded',
      uptimeSeconds: uptimeSec,
      subsystems: [
        {
          id: 'db',
          name: 'MongoDB Atlas (Prisma)',
          status: dbStatus === 'Operational' ? 'Healthy' : 'Degraded',
          latency: dbLatencyMs === null ? 'unavailable' : `${dbLatencyMs}ms`,
          details: 'MongoDB ping command result.',
        },
        {
          id: 'runtime',
          name: 'Node.js Execution Runtime & Heap Allocation',
          status: 'Healthy',
          latency: `${Math.round(memory.heapUsed / 1024 / 1024)}MB Heap`,
          details: `Uptime ${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m · Node ${process.version}`,
        },
      ],
    };
  }

  // Real actionable security alerts (never invented)
  async getSecurityAlerts() {
    const alerts: any[] = [];

    // 1. Check for real negative or denied audit logs
    const suspiciousEvents = await this.prisma.auditLog.findMany({
      where: {
        OR: [
          { reason: { contains: 'fail', mode: 'insensitive' } },
          { reason: { contains: 'denied', mode: 'insensitive' } },
          { reason: { contains: 'unauthorized', mode: 'insensitive' } },
          { reason: { contains: 'revoke', mode: 'insensitive' } },
        ],
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    for (const ev of suspiciousEvents) {
      alerts.push({
        id: ev.id,
        severity: ev.reason.toLowerCase().includes('fail') ? 'high' : 'medium',
        title: `Security Event: ${ev.subject || 'Access Enforcement'}`,
        description: `Actor ${ev.user} (${ev.role}) logged: ${ev.reason}`,
        timestamp: ev.changedAt || ev.createdAt.toISOString(),
        category: 'Audit Monitor',
      });
    }

    // 2. Check for inactive administrative users requiring access recertification
    const inactiveAdmins = await this.prisma.user.findMany({
      where: {
        isActive: false,
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'HOD'] },
      },
      take: 2,
    });

    for (const admin of inactiveAdmins) {
      alerts.push({
        id: `inactive-${admin.id}`,
        severity: 'low',
        title: `Dormant Privileged Account: ${admin.name}`,
        description: `Privileged account ${admin.identifier} (${admin.role}) is inactive and pending lifecycle recertification.`,
        timestamp: admin.updatedAt.toISOString(),
        category: 'Identity Governance',
      });
    }

    return alerts;
  }

  // Staff Rosters (Wardens, Security, Canteen, Support)
  async getStaffRoster(staffType?: string, search?: string) {
    const where: any = {};
    if (staffType && staffType !== 'All') {
      where.staffType = staffType.toUpperCase();
    }
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { badgeNumber: { contains: q, mode: 'insensitive' } },
        { assignedHostelOrPost: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.staffRoster.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(data: any) {
    return this.prisma.staffRoster.create({ data });
  }

  async updateStaff(id: string, data: any) {
    return this.prisma.staffRoster.update({ where: { id }, data });
  }

  async deleteStaff(id: string) {
    return this.prisma.staffRoster.delete({ where: { id } });
  }

  // Audit Logs
  async getAuditLogs(search?: string) {
    const where: any = {};
    if (search) {
      const q = search.trim();
      where.OR = [
        { user: { contains: q, mode: 'insensitive' } },
        { targetStudent: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { reason: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAuditLog(data: any) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      },
    });
  }

  // Incident persistence is not configured. Never report process-local fixture incidents as live security events.
  async getIncidents(_severity?: string, _status?: string, _search?: string): Promise<never> {
    throw new ServiceUnavailableException('Security incident tracking is unavailable until a persistent incident provider is configured.');
  }

  async updateIncidentStatus(_id: string, _status: string, _notes: string, _actor: any): Promise<never> {
    throw new ServiceUnavailableException('Security incident updates are unavailable until persistent incident tracking is configured.');
  }

  // Runtime log aggregation is not connected to a persistent logging provider.
  async getSystemLogs(_level?: string, _component?: string, _search?: string): Promise<never> {
    throw new ServiceUnavailableException('System log search is unavailable until a logging provider is configured.');
  }

  // JWT authentication is stateless; there is no persisted session registry or revocation mechanism yet.
  async getSessions(): Promise<never> {
    throw new ServiceUnavailableException('Session management is unavailable until persisted sessions and revocation are configured.');
  }

  async revokeSession(_sessionId: string, _actor: any): Promise<never> {
    throw new ServiceUnavailableException('Session revocation is unavailable until persisted sessions and revocation are configured.');
  }

  // --- Integrations & API Management ---
  async getIntegrations() {
    const endpoint = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
    return [{
      id: 'ai_service',
      name: 'Apna Campus AI Service',
      provider: 'FastAPI',
      endpoint,
      status: 'Configured',
      latencyMs: null,
      lastPing: null,
      lastError: null,
    }];
  }

  async testIntegration(id: string) {
    if (id !== 'ai_service') {
      throw new NotFoundException(`Integration ${id} is not configured.`);
    }
    const endpoint = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const start = Date.now();
    let response: Response;
    try {
      response = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(3500) });
    } catch {
      throw new ServiceUnavailableException('AI service health check failed or timed out.');
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(`AI service health check returned HTTP ${response.status}.`);
    }
    const health = await response.json();
    return {
      id,
      status: health.status === 'healthy' ? 'Operational' : 'Degraded',
      latencyMs: Date.now() - start,
      testedAt: new Date().toISOString(),
      message: `AI service health: ${health.status || 'unknown'}.`,
    };
  }

  // --- User Directory Governance ---
  async getUsers(search?: string, role?: string, status?: string) {
    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role.toUpperCase();
    }
    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') where.isActive = true;
      if (status === 'INACTIVE' || status === 'SUSPENDED') where.isActive = false;
    }
    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { identifier: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        identifier: true,
        name: true,
        email: true,
        role: true,
        department: true,
        designation: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        student: {
          select: { rollNumber: true, semester: true, cgpa: true, status: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async updateUserStatus(id: string, isActive: boolean, actor: any) {
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('Account active status must be true or false.');
    }
    if (actor.id === id) {
      throw new ForbiddenException('You cannot change your own account status.');
    }

    return this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id },
        select: { id: true, identifier: true, name: true, role: true, isActive: true },
      });
      if (!target) throw new NotFoundException('The user account was not found.');
      this.assertActorCanManageRole(actor.role, target.role, 'change the status of');
      if (target.isActive === isActive) return target;

      const changed = await tx.user.updateMany({
        where: { id, role: target.role, isActive: target.isActive },
        data: { isActive },
      });
      if (changed.count !== 1) {
        throw new ConflictException('This account changed while the status update was being processed. Refresh the directory and try again.');
      }

      const updated = { ...target, isActive };
      const actorName = actor.name || actor.identifier || 'Administrator';
      await tx.auditLog.create({
        data: {
          user: actorName,
          role: actor.role || 'ADMIN',
          action: isActive ? 'User Account Activated' : 'User Account Suspended',
          target: `User: ${updated.name} (${updated.identifier})`,
          oldValue: `isActive: ${target.isActive}`,
          newValue: `isActive: ${isActive}`,
          reason: `Account status updated by administrative officer ${actorName}`,
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });
      return updated;
    });
  }

  async resetUserPassword(_id: string, _actor: any): Promise<never> {
    throw new ServiceUnavailableException('Administrative password reset is unavailable until secure email delivery is configured.');
  }

  async getApprovals() {
    const requests = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'ADMIN_APPROVAL' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return requests.map((request) => {
      const details = this.asRecord(request.details);
      return {
        id: request.id,
        title: request.title,
        category: details.category ?? 'General',
        severity: details.severity ?? 'Standard',
        status: request.status,
        requesterName: request.requesterName,
        requesterRole: request.requesterRole,
        requesterId: request.requesterId,
        requestedAt: request.createdAt.toISOString(),
        scope: details.scope ?? '',
        justification: details.justification ?? '',
        impactStatement: details.impactStatement ?? '',
        actionHistory: Array.isArray(request.history) ? request.history : [],
        decidedBy: request.approverName,
        decisionReason: request.approvalNotes,
        decidedAt: request.status === 'PENDING' ? null : request.updatedAt.toISOString(),
      };
    });
  }

  async createApproval(data: any, requester: any) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new BadRequestException('Approval request payload is invalid.');
    }
    const title = String(data.title ?? '').trim();
    const justification = String(data.justification ?? '').trim();
    if (!title || justification.length < 5) {
      throw new BadRequestException('A title and a justification of at least 5 characters are required.');
    }
    const now = new Date();
    const actor = requester.name || requester.identifier || requester.id;
    const request = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'ADMIN_APPROVAL',
        title,
        requesterId: requester.id,
        requesterName: requester.name || requester.identifier,
        requesterRole: requester.role,
        department: requester.department || null,
        currentStage: 'PENDING',
        status: 'PENDING',
        details: {
          category: String(data.category ?? 'General').trim(),
          severity: String(data.severity ?? 'Standard').trim(),
          scope: String(data.scope ?? '').trim(),
          justification,
          impactStatement: String(data.impactStatement ?? '').trim(),
        },
        history: [{ action: 'SUBMITTED', actor, timestamp: now.toISOString(), note: justification }],
      },
    });
    return (await this.getApprovals()).find((item) => item.id === request.id);
  }

  async decideApproval(id: string, decision: 'APPROVED' | 'REJECTED', reason: string, actor: any) {
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new BadRequestException('Decision must be APPROVED or REJECTED.');
    }
    if (reason.trim().length < 5) {
      throw new BadRequestException('A decision reason of at least 5 characters is required.');
    }
    const existing = await this.prisma.workflowRequest.findFirst({
      where: { id, workflowType: 'ADMIN_APPROVAL' },
    });
    if (!existing) throw new NotFoundException('Approval request was not found.');
    if (existing.status !== 'PENDING') throw new ConflictException('This approval request has already been decided.');

    const timestamp = new Date().toISOString();
    const actorLabel = `${actor.name || actor.identifier || actor.id} (${actor.role})`;
    const history = Array.isArray(existing.history) ? existing.history : [];
    const nextHistory = [...history, { action: decision, actor: actorLabel, timestamp, note: reason.trim() }];
    const updated = await this.prisma.$transaction(async (tx) => {
      const changed = await tx.workflowRequest.updateMany({
        where: { id, workflowType: 'ADMIN_APPROVAL', status: 'PENDING' },
        data: {
          status: decision,
          currentStage: decision,
          approverId: actor.id,
          approverName: actorLabel,
          approvalNotes: reason.trim(),
          history: nextHistory as any,
        },
      });
      if (changed.count !== 1) throw new ConflictException('This approval request changed while the decision was being processed. Refresh and try again.');

      await tx.auditLog.create({
        data: {
          user: actor.name || actor.identifier || 'Administrator',
          role: actor.role || 'ADMIN',
          subject: `Administrative approval ${decision}`,
          reason: reason.trim(),
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });
      return tx.workflowRequest.findFirst({ where: { id, workflowType: 'ADMIN_APPROVAL' } });
    });
    return (await this.getApprovals()).find((item) => item.id === updated?.id);
  }

  private asRecord(value: unknown): Record<string, any> {
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
  }

  // --- Disaster Recovery Restoration ---
  async restoreBackup(_id: string, _confirmationCode: string, _actor: any) {
    throw new ServiceUnavailableException('Backup and restore storage is not configured.');
  }

  // --- RBAC & System Settings Persistence ---
  async saveRbacPermissions(roleKey: string, permissions: string[], actor: any) {
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(roleKey) || !Array.isArray(permissions) || permissions.length > 200 ||
      permissions.some((permission) => typeof permission !== 'string' || !/^[a-z][a-z0-9_.-]{0,99}$/.test(permission))) {
      throw new BadRequestException('The RBAC role or permission list is invalid.');
    }
    // Root protection guard: super_admin cannot lose core governance permissions
    if (roleKey === 'super_admin') {
      if (!permissions.includes('manage_rbac_matrix')) permissions.push('manage_rbac_matrix');
      if (!permissions.includes('manage_system_settings')) permissions.push('manage_system_settings');
    }

    const normalized = [...new Set(permissions)];
    const setting = await this.prisma.systemSetting.upsert({
      where: { key: `rbac:${roleKey}` },
      create: { key: `rbac:${roleKey}`, value: JSON.stringify(normalized), category: 'RBAC', updatedBy: actor.id },
      update: { value: JSON.stringify(normalized), category: 'RBAC', updatedBy: actor.id },
    });

    await this.createAuditLog({
      user: actor.name || actor.identifier || 'Super Administrator',
      role: actor.role || 'SUPER_ADMIN',
      action: `RBAC Permission Matrix Updated for [${roleKey.toUpperCase()}]`,
      target: `Role: ${roleKey}`,
      oldValue: 'Previous Grants',
      newValue: `${normalized.length} Granular Permissions Stored`,
      reason: `Role-based access matrix policy reconfiguration executed by ${actor.name || actor.identifier}`,
    });

    return { success: true, roleKey, permissionsCount: normalized.length, updatedAt: setting.updatedAt };
  }

  async saveSettings(settings: any, actor: any) {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      throw new BadRequestException('Settings payload must be an object.');
    }
    const entries = Object.entries(settings as Record<string, unknown>);
    if (entries.length > 100) throw new BadRequestException('At most 100 setting values may be updated at once.');
    for (const [key, value] of entries) {
      if (!/^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(key) || /secret|password|token|credential|private.?key|database.?url|api.?key/i.test(key) || value === undefined || typeof value === 'function') {
        throw new BadRequestException('Settings contain an invalid key or value.');
      }
      const serialized = JSON.stringify(value);
      if (serialized === undefined || serialized.length > 5000) {
        throw new BadRequestException(`Setting ${key} is too large or cannot be serialized.`);
      }
    }
    await this.prisma.$transaction(async (tx) => {
      for (const [key, value] of entries) {
        await tx.systemSetting.upsert({
          where: { key: `institution:${key}` },
          create: { key: `institution:${key}`, value: JSON.stringify(value), category: 'Institution', updatedBy: actor.id },
          update: { value: JSON.stringify(value), category: 'Institution', updatedBy: actor.id },
        });
      }
    });

    await this.createAuditLog({
      user: actor.name || actor.identifier || 'Super Administrator',
      role: actor.role || 'SUPER_ADMIN',
      action: 'Institutional System & Security Configuration Updated',
      target: `Institution: ${settings.institutionName || 'Apna Campus'}`,
      oldValue: 'Previous Configuration',
      newValue: `Attendance: ${settings.minimumAttendancePercentage}% | System: ${settings.gradingSystem || 'Absolute 10-pt'}`,
      reason: `Institutional policy update saved by ${actor.name || actor.identifier}`,
    });

    return { success: true, settings: await this.getSettings() };
  }

  async getSettings() {
    const records = await this.prisma.systemSetting.findMany({
      where: { key: { startsWith: 'institution:' } },
      orderBy: { key: 'asc' },
    });
    return Object.fromEntries(records.map((record) => {
      try { return [record.key.slice('institution:'.length), JSON.parse(record.value)]; }
      catch { return [record.key.slice('institution:'.length), record.value]; }
    }));
  }

  async getRbacPermissions() {
    const records = await this.prisma.systemSetting.findMany({ where: { key: { startsWith: 'rbac:' } } });
    return Object.fromEntries(records.map((record) => {
      try { return [record.key.slice('rbac:'.length), JSON.parse(record.value)]; }
      catch { return [record.key.slice('rbac:'.length), []]; }
    }));
  }

  async getBackups(): Promise<never> {
    throw new ServiceUnavailableException('Backup storage is not configured.');
  }

  async triggerBackup(_actor: any) {
    throw new ServiceUnavailableException('Backup storage is not configured.');
  }

  async createUserAccount(data: any, actor: any) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    const identifier = typeof data.identifier === 'string' ? data.identifier.trim() : '';
    if (!name || !email || !identifier) {
      throw new BadRequestException('Name, email, and account identifier are required.');
    }
    if (typeof data.password !== 'string' || Buffer.byteLength(data.password, 'utf8') < 12 || Buffer.byteLength(data.password, 'utf8') > 72) {
      throw new BadRequestException('The initial password must be between 12 and 72 bytes.');
    }
    const role = String(data.role).trim().toUpperCase() as Role;
    if (String(actor.role || '').toUpperCase() !== Role.SUPER_ADMIN) {
      this.assertActorCanManageRole(actor.role, role, 'provision');
    }
    const pwdHash = await bcrypt.hash(data.password, 12);
    const actorName = actor.name || actor.identifier || 'Super Administrator';
    const departmentName = typeof data.department === 'string' ? data.department.trim() : '';

    // Commit the account and its required audit record together. Previously a
    // successful insert followed by an audit failure surfaced as a 500, making
    // the UI report failure even though the account had already been created.
    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { identifier }] },
        select: { email: true, identifier: true },
      });
      if (existingUser) {
        const duplicateFields = [
          existingUser.email === email ? 'email' : null,
          existingUser.identifier === identifier ? 'account identifier' : null,
        ].filter(Boolean);
        throw new ConflictException(
          `A user with this ${duplicateFields.join(' and ')} already exists. Enter a different ${duplicateFields.join(' and ')}.`,
        );
      }

      let linkedDepartmentCode: string | undefined;
      if (role === Role.HOD) {
        const department = await tx.department.findFirst({
          where: { name: { equals: departmentName, mode: 'insensitive' } },
          select: { code: true },
        });
        if (!department) {
          throw new BadRequestException('Choose a department that exists in the academic department directory before creating an HOD account.');
        }
        linkedDepartmentCode = department.code;
      }

      const user = await tx.user.create({
        data: {
          identifier,
          name,
          email,
          role,
          department: departmentName || null,
          passwordHash: pwdHash,
          isActive: true,
          isActivated: true,
          ...(role === Role.STUDENT ? {
            student: {
              create: {
                studentId: identifier,
                rollNumber: identifier,
                name,
                email,
                department: departmentName || 'Unassigned',
              },
            },
          } : {}),
          ...(role === Role.FACULTY ? {
            faculty: {
              create: {
                employeeId: identifier,
                name,
                email,
                department: departmentName || 'Computer Science & Engineering',
                assignedSubjects: [],
                assignedSections: [],
              },
            },
          } : {}),
          ...(role === Role.HOD ? {
            hod: {
              create: {
                employeeId: identifier,
                name,
                email,
                department: departmentName,
                deptCode: linkedDepartmentCode!,
              },
            },
          } : {}),
        },
        select: {
          id: true,
          identifier: true,
          name: true,
          email: true,
          role: true,
          department: true,
          designation: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          user: actorName,
          role: actor.role || 'SUPER_ADMIN',
          action: 'New Institutional Account Created',
          target: `User: ${user.name} (${user.identifier})`,
          oldValue: 'NONE',
          newValue: `Role: ${user.role} | Department: ${user.department || 'Unassigned'}`,
          reason: `Account provisioned by administrative officer ${actorName}`,
          changedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        },
      });

      return user;
    });
  }
}


