import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AiAssignmentService } from './ai-assignment.service';
import { CreateGatePassDto } from './hostel.dto';

@Injectable()
export class HostelService {
  private readonly logger = new Logger(HostelService.name);

  constructor(
    public readonly prisma: PrismaService,
    public readonly aiAssignmentService: AiAssignmentService,
  ) {}

  // ==========================================
  // 1. HOSTEL & INFRASTRUCTURE MANAGEMENT
  // ==========================================
  async getHostels() {
    const [hostels, rooms] = await Promise.all([
      this.prisma.hostel.findMany(),
      this.prisma.hostelRoom.findMany(),
    ]);
    const byHostel = new Map<string, typeof rooms>();
    for (const room of rooms) {
      const hostelRooms = byHostel.get(room.hostelId) || [];
      hostelRooms.push(room);
      byHostel.set(room.hostelId, hostelRooms);
    }

    return hostels.map((hostel) => {
      const hostelRooms = byHostel.get(hostel.id) || [];
      const totalBeds = hostelRooms.reduce((total, room) => total + room.capacity, 0);
      const occupiedBeds = hostelRooms.reduce((total, room) => total + room.occupied, 0);
      return {
        ...hostel,
        totalRooms: hostelRooms.length,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(0, totalBeds - occupiedBeds),
      };
    });
  }

  async getHostelRooms(hostelId?: string, floor?: string) {
    const where: any = {};
    if (hostelId && hostelId !== 'ALL' && hostelId !== 'All') where.hostelId = hostelId;
    if (floor && floor !== 'ALL' && floor !== 'All') where.floor = floor;

    return this.prisma.hostelRoom.findMany({ where });
  }

  async getStaffRosterIdForUser(user: { id: string; email?: string }) {
    if (user.email) {
      const matches = await this.prisma.staffRoster.findMany({
        where: { email: { equals: user.email, mode: 'insensitive' } },
        select: { id: true },
        take: 2,
      });
      if (matches.length === 1) return matches[0].id;
      if (matches.length > 1) throw new ForbiddenException('This login matches more than one staff roster record. Contact an administrator.');
    }

    const rosterMember = await this.prisma.staffRoster.findUnique({ where: { id: user.id }, select: { id: true } });
    if (!rosterMember) throw new ForbiddenException('The staff account is not linked to a maintenance roster record.');
    return rosterMember.id;
  }

  // ==========================================
  // 2. RESIDENT BED ALLOCATION & TRANSFERS
  // ==========================================
  private hostelBedClaimId(hostelName: string, roomNumber: string, bedNumber: string) {
    const key = `${hostelName.trim().toLowerCase()}|${roomNumber.trim().toLowerCase()}|${bedNumber.trim().toLowerCase()}`;
    return `hostelbed_${createHash('sha256').update(key).digest('hex')}`;
  }

  private async reserveBedSlot(tx: any, args: {
    hostelName: string;
    roomNumber: string;
    bedNumber: string;
    floor: string;
    student: { id: string; name: string; rollNumber: string; department: string };
    actor: { id: string; name: string; role: string };
    reason?: string;
  }) {
    const id = this.hostelBedClaimId(args.hostelName, args.roomNumber, args.bedNumber);
    const existing = await tx.workflowRequest.findUnique({ where: { id } });
    const details = {
      studentId: args.student.id,
      studentName: args.student.name,
      studentRoll: args.student.rollNumber,
      hostelName: args.hostelName,
      roomNumber: args.roomNumber,
      bedNumber: args.bedNumber,
      floor: args.floor,
      reason: args.reason || null,
      claimedAt: new Date().toISOString(),
    };

    if (!existing) {
      await tx.workflowRequest.create({
        data: {
          id,
          workflowType: 'HOSTEL_BED_ALLOCATION',
          title: `Hostel bed ${args.hostelName} ${args.roomNumber}-${args.bedNumber}`,
          requesterId: args.actor.id,
          requesterName: args.actor.name,
          requesterRole: args.actor.role,
          department: args.student.department,
          details,
          currentStage: 'ACTIVE',
          status: 'ACTIVE',
        },
      });
      return;
    }

    if (existing.workflowType !== 'HOSTEL_BED_ALLOCATION' || existing.status === 'ACTIVE') {
      throw new ConflictException(`Bed ${args.bedNumber} in room ${args.roomNumber} is already allocated.`);
    }

    const changed = await tx.workflowRequest.updateMany({
      where: { id, workflowType: 'HOSTEL_BED_ALLOCATION', status: existing.status },
      data: {
        requesterId: args.actor.id,
        requesterName: args.actor.name,
        requesterRole: args.actor.role,
        department: args.student.department,
        details,
        currentStage: 'ACTIVE',
        status: 'ACTIVE',
        approverId: null,
        approverName: null,
        approvalNotes: null,
      },
    });
    if (changed.count !== 1) throw new ConflictException('This bed was allocated by another request. Refresh and try again.');
  }

  private async releaseBedSlot(tx: any, student: { id: string; hostelName: string; roomNumber: string; bedNumber: string }, status: 'TRANSFERRED' | 'VACATED', actor: { id: string; name: string }) {
    const id = this.hostelBedClaimId(student.hostelName, student.roomNumber, student.bedNumber);
    const claim = await tx.workflowRequest.findUnique({ where: { id } });
    if (!claim) return;
    const details = typeof claim.details === 'object' && claim.details !== null ? claim.details as Record<string, unknown> : {};
    if (details.studentId !== student.id) {
      throw new ConflictException('The bed claim belongs to another student; checkout was not applied.');
    }
    const changed = await tx.workflowRequest.updateMany({
      where: { id, workflowType: 'HOSTEL_BED_ALLOCATION', status: 'ACTIVE' },
      data: {
        status,
        currentStage: status,
        approverId: actor.id,
        approverName: actor.name,
        approvalNotes: status === 'VACATED' ? 'Bed vacated' : 'Student transferred',
      },
    });
    if (changed.count !== 1) throw new ConflictException('The bed claim changed during checkout. Refresh and try again.');
  }

  async allocateBed(
    data: { studentRoll: string; hostelName: string; roomNumber: string; bedNumber: string; floor?: string },
    actor: { id: string; name: string; role: string },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { rollNumber: data.studentRoll.trim() },
      select: { id: true, name: true, rollNumber: true, department: true, hostelName: true, roomNumber: true, bedNumber: true },
    });
    if (!student) throw new NotFoundException(`Student with Roll Number "${data.studentRoll}" not found in institutional registry.`);
    if (student.hostelName || student.roomNumber || student.bedNumber) {
      throw new ConflictException('This student already has a hostel allocation. Use the transfer workflow or vacate the current bed first.');
    }

    const room = await this.prisma.hostelRoom.findFirst({
      where: { hostelName: data.hostelName.trim(), roomNumber: data.roomNumber.trim() },
    });
    if (!room) throw new NotFoundException('The selected hostel room does not exist.');

    try {
      const updatedStudent = await this.prisma.$transaction(async (tx) => {
        const occupiedBed = await tx.student.findFirst({
          where: { hostelName: room.hostelName, roomNumber: room.roomNumber, bedNumber: data.bedNumber.trim() },
          select: { id: true },
        });
        if (occupiedBed) throw new ConflictException('The selected bed is already occupied.');

        await this.reserveBedSlot(tx, {
          hostelName: room.hostelName,
          roomNumber: room.roomNumber,
          bedNumber: data.bedNumber.trim(),
          floor: data.floor?.trim() || room.floor,
          student,
          actor,
        });

        const capacityChanged = await tx.hostelRoom.updateMany({
          where: { id: room.id, capacity: room.capacity, occupied: { lt: room.capacity } },
          data: { occupied: { increment: 1 } },
        });
        if (capacityChanged.count !== 1) throw new ConflictException('The selected room is at capacity or changed during allocation.');

        const studentChanged = await tx.student.updateMany({
          where: { id: student.id, hostelName: null, roomNumber: null, bedNumber: null },
          data: {
            hostelName: room.hostelName,
            roomNumber: room.roomNumber,
            bedNumber: data.bedNumber.trim(),
            floor: data.floor?.trim() || room.floor,
          },
        });
        if (studentChanged.count !== 1) throw new ConflictException('The student received another hostel allocation. Refresh the roster.');
        return tx.student.findUnique({
          where: { id: student.id },
          select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true, bedNumber: true, floor: true },
        });
      });

      return {
        success: true,
        message: `Bed ${data.bedNumber} in Room ${data.roomNumber} allocated to ${student.name} (${student.rollNumber}).`,
        student: updatedStudent,
      };
    } catch (error) {
      if (['P2002', 'P2034'].includes((error as any)?.code)) throw new ConflictException('This bed or room capacity changed during allocation. Refresh and try again.');
      throw error;
    }
  }

  async transferBed(
    data: { studentRoll: string; newHostelName: string; newRoomNumber: string; newBedNumber: string; newFloor?: string; transferReason?: string },
    actor: { id: string; name: string; role: string },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { rollNumber: data.studentRoll.trim() },
      select: { id: true, name: true, rollNumber: true, department: true, hostelName: true, roomNumber: true, bedNumber: true, floor: true },
    });
    if (!student) throw new NotFoundException(`Student ${data.studentRoll} not found.`);
    if (!student.hostelName || !student.roomNumber || !student.bedNumber) {
      throw new BadRequestException('The student has no current hostel bed to transfer.');
    }
    const targetRoom = await this.prisma.hostelRoom.findFirst({
      where: { hostelName: data.newHostelName.trim(), roomNumber: data.newRoomNumber.trim() },
    });
    if (!targetRoom) throw new NotFoundException('The selected target room does not exist.');
    if (student.hostelName === targetRoom.hostelName && student.roomNumber === targetRoom.roomNumber && student.bedNumber === data.newBedNumber.trim()) {
      throw new BadRequestException('The student is already assigned to the selected bed.');
    }
    const oldRoom = await this.prisma.hostelRoom.findFirst({
      where: { hostelName: student.hostelName, roomNumber: student.roomNumber },
    });
    if (!oldRoom) throw new ConflictException('The current room record is missing; transfer was not applied.');

    try {
      const updatedStudent = await this.prisma.$transaction(async (tx) => {
        const occupiedBed = await tx.student.findFirst({
          where: {
            hostelName: targetRoom.hostelName,
            roomNumber: targetRoom.roomNumber,
            bedNumber: data.newBedNumber.trim(),
            id: { not: student.id },
          },
          select: { id: true },
        });
        if (occupiedBed) throw new ConflictException('The selected target bed is already occupied.');

        await this.reserveBedSlot(tx, {
          hostelName: targetRoom.hostelName,
          roomNumber: targetRoom.roomNumber,
          bedNumber: data.newBedNumber.trim(),
          floor: data.newFloor?.trim() || targetRoom.floor,
          student,
          actor,
          reason: data.transferReason,
        });

        if (oldRoom.id !== targetRoom.id) {
          const capacityChanged = await tx.hostelRoom.updateMany({
            where: { id: targetRoom.id, capacity: targetRoom.capacity, occupied: { lt: targetRoom.capacity } },
            data: { occupied: { increment: 1 } },
          });
          if (capacityChanged.count !== 1) throw new ConflictException('The target room is at capacity or changed during transfer.');
          const oldRoomChanged = await tx.hostelRoom.updateMany({
            where: { id: oldRoom.id, occupied: { gt: 0 } },
            data: { occupied: { decrement: 1 } },
          });
          if (oldRoomChanged.count !== 1) throw new ConflictException('The current room occupancy is inconsistent; transfer was not applied.');
        }

        await this.releaseBedSlot(tx, student as { id: string; hostelName: string; roomNumber: string; bedNumber: string }, 'TRANSFERRED', actor);
        const studentChanged = await tx.student.updateMany({
          where: {
            id: student.id,
            hostelName: student.hostelName,
            roomNumber: student.roomNumber,
            bedNumber: student.bedNumber,
          },
          data: {
            hostelName: targetRoom.hostelName,
            roomNumber: targetRoom.roomNumber,
            bedNumber: data.newBedNumber.trim(),
            floor: data.newFloor?.trim() || targetRoom.floor,
          },
        });
        if (studentChanged.count !== 1) throw new ConflictException('The student allocation changed during transfer. Refresh and try again.');
        return tx.student.findUnique({
          where: { id: student.id },
          select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true, bedNumber: true, floor: true },
        });
      });

      return {
        success: true,
        message: `Student transferred from Room ${student.roomNumber} to ${targetRoom.roomNumber} (${data.newBedNumber}).`,
        student: updatedStudent,
      };
    } catch (error) {
      if (['P2002', 'P2034'].includes((error as any)?.code)) throw new ConflictException('The selected bed or room capacity changed during transfer. Refresh and try again.');
      throw error;
    }
  }

  async vacateBed(
    studentRoll: string,
    checkoutNotes: string | undefined,
    actor: { id: string; name: string },
  ) {
    const student = await this.prisma.student.findUnique({
      where: { rollNumber: studentRoll.trim() },
      select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true, bedNumber: true },
    });
    if (!student) throw new NotFoundException(`Student ${studentRoll} not found.`);
    if (!student.hostelName || !student.roomNumber || !student.bedNumber) {
      throw new BadRequestException('The student does not have an active hostel bed to vacate.');
    }
    const oldRoom = await this.prisma.hostelRoom.findFirst({
      where: { hostelName: student.hostelName, roomNumber: student.roomNumber },
    });
    if (!oldRoom) throw new ConflictException('The current room record is missing; the bed was not vacated.');

    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      const roomChanged = await tx.hostelRoom.updateMany({
        where: { id: oldRoom.id, occupied: { gt: 0 } },
        data: { occupied: { decrement: 1 } },
      });
      if (roomChanged.count !== 1) throw new ConflictException('The room occupancy is inconsistent; the bed was not vacated.');

      await this.releaseBedSlot(tx, student as { id: string; hostelName: string; roomNumber: string; bedNumber: string }, 'VACATED', actor);
      const studentChanged = await tx.student.updateMany({
        where: {
          id: student.id,
          hostelName: student.hostelName,
          roomNumber: student.roomNumber,
          bedNumber: student.bedNumber,
        },
        data: { hostelName: null, roomNumber: null, bedNumber: null, floor: null },
      });
      if (studentChanged.count !== 1) throw new ConflictException('The student allocation changed during checkout. Refresh and try again.');
      return tx.student.findUnique({
        where: { id: student.id },
        select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true, bedNumber: true, floor: true },
      });
    });

    return {
      success: true,
      message: `Bed vacated for student ${student.name}. Room ${student.roomNumber} capacity restored.`,
      checkoutNotes: checkoutNotes?.trim() || null,
      student: updatedStudent,
    };
  }

  // ==========================================
  // 3. STUDENT SELF RESIDENCE VIEW
  // ==========================================
  async getMyResidence(rollNumber: string) {
    const student = await this.prisma.student.findFirst({
      where: { rollNumber },
    });
    if (!student) {
      throw new NotFoundException('Student residence record was not found.');
    }

    const roommates = student.hostelName && student.roomNumber
      ? await this.prisma.student.findMany({
          where: {
            id: { not: student.id },
            hostelName: student.hostelName,
            roomNumber: student.roomNumber,
          },
          select: {
            name: true,
            rollNumber: true,
            department: true,
            semester: true,
            bedNumber: true,
          },
        })
      : [];

    return {
      hostelName: student.hostelName,
      roomNumber: student.roomNumber,
      bedNumber: student.bedNumber,
      floor: student.floor,
      wardenName: student.wardenName,
      wardenContact: student.wardenContact,
      roommates: roommates.map((roommate) => ({
        name: roommate.name,
        roll: roommate.rollNumber,
        branch: [roommate.department, roommate.semester].filter(Boolean).join(' - '),
        bed: roommate.bedNumber,
      })),
      rules: [
        'Night curfews strictly implemented at 8:30 PM.',
        'Biometric attendance check-in compulsory before 8:45 PM.',
        'Mess timings: Breakfast 7:30 - 9:00 AM, Dinner 7:30 - 9:30 PM.',
        'Electric heating appliances and immersion rods strictly prohibited.',
      ],
    };
  }

  // ==========================================
  // 4. MAINTENANCE COMPLAINTS WORKFLOW (AI-POWERED)
  // ==========================================
  async getComplaints(filter: {
    rollNumber?: string;
    category?: string;
    status?: string;
    assignedStaffId?: string;
    needsReview?: boolean;
    search?: string;
  } = {}) {
    const where: any = {};
    if (filter.rollNumber) where.rollNumber = filter.rollNumber;
    if (filter.category && filter.category !== 'ALL') where.category = filter.category;
    if (filter.status && filter.status !== 'ALL') where.status = filter.status;
    if (filter.assignedStaffId) where.assignedStaffId = filter.assignedStaffId;
    if (typeof filter.needsReview === 'boolean') where.needsReview = filter.needsReview;

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { studentName: { contains: filter.search, mode: 'insensitive' } },
        { location: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.hostelComplaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async lodgeComplaint(studentId: string, data: {
    location?: string;
    category?: string;
    title?: string;
    description?: string;
    priority?: string;
    attachmentUrl?: string;
    filename?: string;
  }) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true },
    });
    if (!student) throw new NotFoundException('The authenticated student record was not found.');
    if (!student.hostelName || !student.roomNumber) {
      throw new BadRequestException('A current hostel room allocation is required before lodging a hostel maintenance complaint.');
    }

    let resolvedTitle = (data.title || '').trim();
    let resolvedDesc = (data.description || '').trim();
    let resolvedPriority = data.priority || 'Medium';
    if (!resolvedTitle && !data.attachmentUrl) {
      throw new BadRequestException('Provide a complaint title or an image for analysis.');
    }

    // Duplicate submission suppression (same student + title within last 60s)
    if (resolvedTitle) {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const existingRecent = await this.prisma.hostelComplaint.findFirst({
        where: {
          rollNumber: student.rollNumber,
          title: resolvedTitle,
          createdAt: { gte: oneMinuteAgo },
        },
      });
      if (existingRecent) {
        this.logger.warn(`Duplicate complaint suppressed for ${student.rollNumber}: "${resolvedTitle}". Returning existing record.`);
        return existingRecent;
      }
    }

    let aiResult: any;

    // If an image is attached and title/description are empty or brief, run AI Vision first
    if (data.attachmentUrl && (!resolvedTitle || !resolvedDesc)) {
      this.logger.log('Detecting maintenance problem directly from uploaded photo...');
      const visionRes = await this.aiAssignmentService.predictFromImage(
        data.attachmentUrl,
        data.filename,
        data.location
      );
      if (!resolvedTitle) resolvedTitle = visionRes.title;
      if (!resolvedDesc) resolvedDesc = visionRes.description;
      resolvedPriority = visionRes.suggestedPriority || resolvedPriority;
      aiResult = {
        category: visionRes.collegeCategory || visionRes.category,
        confidence: visionRes.confidence,
        needsReview: visionRes.needsReview,
        reviewReason: visionRes.needsReview ? 'Flagged for human supervisor verification' : undefined,
        source: visionRes.source,
      };
    } else {
      const complaintText = [resolvedTitle, resolvedDesc].filter(Boolean).join('. ');
      aiResult = await this.aiAssignmentService.predictCategory(complaintText, data.category);
    }

    // Standardize 7 college categories taxonomy
    const categoryMap: Record<string, string> = {
      plumbing: 'Plumbing',
      electrical: 'Electrical',
      cleaning: 'Cleaning',
      furniture: 'Furniture',
      civil: 'Civil',
      maintenance: 'Civil',
      network: 'Network',
      internet_it: 'Network',
      other: 'Other',
    };

    // Student confirmed category always takes precedence over AI prediction
    const studentSelected = data.category ? (categoryMap[data.category.toLowerCase()] || data.category) : null;
    const aiSuggested = categoryMap[aiResult.category?.toLowerCase()] || 'Other';
    const finalCategory = studentSelected || aiSuggested;

    // 2. Run Automatic Staff Assignment engine using final verified category
    const assignmentResult = await this.aiAssignmentService.assignStaffByWorkload(
      finalCategory,
      aiResult.needsReview
    );

    // 3. Determine lifecycle status
    let initialStatus = 'Pending';
    if (aiResult.needsReview) {
      initialStatus = 'Needs Review';
    } else if (assignmentResult.assignedStaffId) {
      initialStatus = 'Assigned';
    }

    const resolutionNotes = assignmentResult.notes || (
      aiResult.needsReview
        ? 'Flagged for supervisor triage: ' + (aiResult.reviewReason || 'Uncertain classification')
        : `Assigned to ${assignmentResult.assignedStaffName || 'maintenance staff'}.`
    );

    // 4. Save the complaint through the configured Prisma database connector.
    const complaint = await this.prisma.hostelComplaint.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        hostel: student.hostelName,
        roomNumber: student.roomNumber,
        location: data.location || `${student.hostelName} · Room ${student.roomNumber}`,
        category: finalCategory,
        predictedCategory: aiResult.category || finalCategory,
        confidence: aiResult.confidence,
        needsReview: aiResult.needsReview,
        reviewReason: aiResult.reviewReason || null,
        title: resolvedTitle || 'Maintenance Request',
        description: resolvedDesc || resolvedTitle || 'Maintenance request submitted by student.',
        priority: resolvedPriority,
        status: initialStatus,
        assignedStaffId: assignmentResult.assignedStaffId,
        assignedStaffName: assignmentResult.assignedStaffName,
        assignedStaffPhone: assignmentResult.assignedStaffPhone,
        assignedStaffRole: assignmentResult.assignedStaffRole,
        assignedAt: assignmentResult.assignedStaffId ? new Date() : null,
        attachmentUrl: data.attachmentUrl || null,
        filedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        resolutionNotes,
      },
    });

    this.logger.log(`Created Complaint #${complaint.id} [${finalCategory}] - Status: ${initialStatus}, Staff: ${assignmentResult.assignedStaffName || 'Unassigned'}`);
    return complaint;
  }

  async previewVisionComplaint(imageBase64: string, filename?: string, locationHint?: string) {
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new BadRequestException('Image data (base64 string) is required for analysis.');
    }

    // Limit base64 length to ~7MB (~5MB raw image)
    if (imageBase64.length > 7 * 1024 * 1024) {
      throw new BadRequestException('Image payload exceeds maximum allowed size (5MB). Please upload a smaller photo.');
    }

    return this.aiAssignmentService.predictFromImage(imageBase64, filename, locationHint);
  }


  async updateComplaintStatus(
    id: string,
    status: string,
    assignedStaff?: string,
    resolutionNotes?: string,
    assignedStaffId?: string | null,
    actor?: { id: string; role: string },
  ) {
    const existing = await this.prisma.hostelComplaint.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Complaint ticket with ID #${id} not found.`);
    }

    const transitions: Record<string, string[]> = {
      Pending: ['Assigned', 'Needs Review', 'Rejected', 'Closed'],
      Assigned: ['Assigned', 'In Progress', 'Needs Review', 'Closed'],
      'Needs Review': ['Assigned', 'Rejected', 'Closed'],
      'In Progress': ['Resolved', 'Assigned', 'Closed'],
      Resolved: ['Closed'],
      Rejected: [],
      Closed: [],
    };
    if (!transitions[existing.status]?.includes(status)) {
      throw new ConflictException(`Complaint status cannot transition from ${existing.status} to ${status}.`);
    }

    if (actor?.role === 'staff') {
      if (existing.assignedStaffId !== actor.id) {
        throw new ForbiddenException('Staff may only update complaints assigned to their own account.');
      }
      if (!['In Progress', 'Resolved'].includes(status) || assignedStaffId !== undefined || assignedStaff) {
        throw new ForbiddenException('Assigned staff may only move their own ticket into progress or mark it resolved.');
      }
    }

    const updateData: any = { status };

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    } else if (status === 'Resolved' && !existing.resolutionNotes?.includes('Resolved')) {
      updateData.resolutionNotes = 'Marked resolved by authorized maintenance staff.';
    }

    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
    }

    // Support admin reassignment or manual staff assignment
    if (assignedStaffId === null) {
      updateData.assignedStaffId = null;
      updateData.assignedStaffName = null;
      updateData.assignedStaffPhone = null;
      updateData.assignedStaffRole = null;
      updateData.assignedAt = null;
    } else if (assignedStaffId) {
      const staffMember = await this.prisma.staffRoster.findUnique({ where: { id: assignedStaffId } });
      if (!staffMember || !['Active', 'On Duty'].includes(staffMember.status)) {
        throw new NotFoundException('The selected maintenance staff member is not active.');
      }
      updateData.assignedStaffId = staffMember.id;
      updateData.assignedStaffName = staffMember.name;
      updateData.assignedStaffPhone = staffMember.phone;
      updateData.assignedStaffRole = staffMember.roleOrCategory;
      updateData.assignedAt = new Date();
    } else if (assignedStaff) {
      throw new BadRequestException('Select an active staff record; a display name alone cannot assign a complaint.');
    }

    // If supervisor manually approves/assigns a ticket previously in "Needs Review"
    if (existing.needsReview && (status === 'Assigned' || status === 'In Progress')) {
      updateData.needsReview = false;
    }

    const result = await this.prisma.hostelComplaint.updateMany({
      where: { id, status: existing.status },
      data: updateData,
    });
    if (result.count !== 1) throw new ConflictException('Complaint status changed concurrently. Refresh and retry.');
    return this.prisma.hostelComplaint.findUnique({ where: { id } });
  }

  // ==========================================
  // 5. VISITOR MANAGEMENT & ACCESS PASSES
  // ==========================================
  async getVisitors() {
    return this.prisma.hostelVisitor.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async issueVisitorPass(data: {
    visitorName: string;
    relation: string;
    rollNumber: string;
    inTime?: string;
    purpose: string;
  }, issuedByUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { rollNumber: data.rollNumber.trim() },
      select: { id: true, name: true, rollNumber: true, hostelName: true, roomNumber: true, bedNumber: true },
    });
    if (!student) throw new NotFoundException('Resident student was not found.');
    if (!student.hostelName || !student.roomNumber || !student.bedNumber) {
      throw new BadRequestException('Visitor passes can only be issued for a student with an active hostel allocation.');
    }
    const bedClaim = await this.prisma.workflowRequest.findUnique({
      where: { id: this.hostelBedClaimId(student.hostelName, student.roomNumber, student.bedNumber) },
    });
    const claimDetails = bedClaim?.details && typeof bedClaim.details === 'object' && !Array.isArray(bedClaim.details)
      ? bedClaim.details as Record<string, unknown>
      : {};
    if (bedClaim?.workflowType !== 'HOSTEL_BED_ALLOCATION' || bedClaim.status !== 'ACTIVE' || claimDetails.studentId !== student.id) {
      throw new BadRequestException('A validated active hostel bed allocation is required before issuing a visitor pass.');
    }

    return this.prisma.hostelVisitor.create({
      data: {
        visitorName: data.visitorName.trim(),
        relation: data.relation.trim(),
        studentName: student.name,
        rollNumber: student.rollNumber,
        inTime: data.inTime?.trim() || 'Not scheduled',
        outTime: 'Pending Sign-out',
        passNumber: `VP-${randomUUID()}`,
        purpose: data.purpose.trim(),
        status: 'ISSUED',
        issuedByUserId,
      },
    });
  }

  async checkInVisitor(id: string, badgeNumber?: string) {
    const visitor = await this.prisma.hostelVisitor.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundException('Visitor pass was not found.');
    if (visitor.status !== 'ISSUED') throw new ConflictException('Only an issued visitor pass can be checked in.');
    const checkedInAt = new Date();
    const result = await this.prisma.hostelVisitor.updateMany({
      where: { id, status: 'ISSUED' },
      data: { status: 'CHECKED_IN', badgeNumber: badgeNumber?.trim() || null, checkedInAt },
    });
    if (result.count !== 1) throw new ConflictException('Visitor pass changed while check-in was being recorded. Refresh and retry.');
    return this.prisma.hostelVisitor.findUnique({ where: { id } });
  }

  async checkOutVisitor(id: string) {
    const visitor = await this.prisma.hostelVisitor.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundException('Visitor pass was not found.');
    if (visitor.status !== 'CHECKED_IN') throw new ConflictException('Only a checked-in visitor can be checked out.');
    const checkedOutAt = new Date();
    const timeStr = checkedOutAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const result = await this.prisma.hostelVisitor.updateMany({
      where: { id, status: 'CHECKED_IN' },
      data: { status: 'CHECKED_OUT', outTime: timeStr, checkedOutAt },
    });
    if (result.count !== 1) throw new ConflictException('Visitor pass changed while check-out was being recorded. Refresh and retry.');
    return this.prisma.hostelVisitor.findUnique({ where: { id } });
  }

  // ==========================================
  // 6. OUTING, HOME LEAVE & GATE PASSES
  // ==========================================
  async getGatePasses(status?: string, hostelName?: string, requesterId?: string) {
    const where: any = { workflowType: 'HOSTEL_GATE_PASS' };
    if (requesterId) where.requesterId = requesterId;
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let passes = requests.map(r => {
      const d = (r.details as any) || {};
      return {
        id: r.id,
        passId: d.passId || r.id,
        studentName: r.requesterName,
        rollNumber: d.rollNumber || null,
        department: r.department || null,
        hostelName: d.hostelName || null,
        roomNumber: d.roomNumber || null,
        bedNo: d.bedNo || null,
        purposeType: d.purposeType || null,
        destination: d.destination || null,
        outDateTime: d.outDateTime || null,
        inDateTime: d.inDateTime || null,
        emergencyContact: d.emergencyContact || null,
        parentConsentVerified: d.parentConsentVerified ?? false,
        mentorStatus: d.mentorStatus || 'Not verified',
        mentorRemarks: d.mentorRemarks || null,
        status: r.status,
        wardenRemarks: d.wardenRemarks || '',
        approvedBy: d.approvedBy || null,
        approvedAt: d.approvedAt || null,
        rejectedAt: d.rejectedAt || null,
        actualExitTime: d.actualExitTime || null,
        actualReturnTime: d.actualReturnTime || null,
        isOverdue: r.status === 'Exited' && !d.actualReturnTime && Boolean(d.inDateTime) && new Date(d.inDateTime).getTime() < Date.now(),
        qrCodeString: d.qrCodeString || null,
        createdAt: r.createdAt?.toISOString?.() || null,
      };
    });

    if (status && status !== 'ALL') {
      passes = passes.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (hostelName && hostelName !== 'ALL') {
      passes = passes.filter(p => p.hostelName.toLowerCase().includes(hostelName.toLowerCase()));
    }
    return passes;
  }

  async createGatePass(data: CreateGatePassDto, user: any) {
    const student = await this.prisma.student.findUnique({
      where: { id: user.student.id },
      select: { id: true, name: true, rollNumber: true, department: true, hostelName: true, roomNumber: true, bedNumber: true },
    });
    if (!student) throw new NotFoundException('The authenticated student record was not found.');
    if (!student.hostelName || !student.roomNumber) {
      throw new BadRequestException('A current hostel room allocation is required before requesting a gate pass.');
    }
    const departure = new Date(data.outDateTime);
    const expectedReturn = new Date(data.inDateTime);
    if (!Number.isFinite(departure.getTime()) || !Number.isFinite(expectedReturn.getTime()) || departure <= new Date() || expectedReturn <= departure) {
      throw new BadRequestException('Departure must be in the future and expected return must follow departure.');
    }
    const passId = `GP-${randomUUID()}`;
    const details = {
      passId,
      rollNumber: student.rollNumber,
      hostelName: student.hostelName,
      roomNumber: student.roomNumber,
      bedNo: student.bedNumber,
      purposeType: data.purposeType.trim(),
      destination: data.destination.trim(),
      outDateTime: departure.toISOString(),
      inDateTime: expectedReturn.toISOString(),
      emergencyContact: data.emergencyContact?.trim() || null,
      parentConsentVerified: false,
      mentorStatus: 'Not verified',
      mentorRemarks: null,
      wardenRemarks: null,
      actualExitTime: null,
      actualReturnTime: null,
      qrCodeString: null,
    };

    return this.prisma.workflowRequest.create({
      data: {
        workflowType: 'HOSTEL_GATE_PASS',
        title: `Gate Pass for ${student.name} (${details.purposeType})`,
        requesterId: user.id,
        requesterName: student.name,
        requesterRole: 'STUDENT',
        department: student.department,
        details,
        currentStage: 'Warden Review',
        status: 'Pending Warden Approval',
        history: [
          {
            action: 'SUBMITTED',
            stage: 'Pending Warden Approval',
            by: student.name,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  }

  async actionGatePass(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'RECORD_EXIT' | 'RECORD_RETURN',
    actor: { id: string; name: string; role: string },
    remarks?: string,
  ) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Gate pass request not found.');
    if (req.workflowType !== 'HOSTEL_GATE_PASS') throw new NotFoundException('Gate pass request not found.');

    const allowedTransitions: Record<string, { status: string; nextStatus: string }> = {
      APPROVE: { status: 'Pending Warden Approval', nextStatus: 'Approved' },
      REJECT: { status: 'Pending Warden Approval', nextStatus: 'Rejected' },
      RECORD_EXIT: { status: 'Approved', nextStatus: 'Exited' },
      RECORD_RETURN: { status: 'Exited', nextStatus: 'Returned' },
    };
    const transition = allowedTransitions[action];
    if (!transition) throw new BadRequestException('Unsupported gate pass action.');
    if (req.status !== transition.status) {
      throw new ConflictException(`Gate pass is ${req.status} and cannot perform ${action}.`);
    }

    const details = { ...((req.details as any) || {}) };
    const history = (req.history as any[]) || [];
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (action === 'APPROVE') {
      details.wardenRemarks = remarks || `Approved by ${actor.name}`;
      details.approvedAt = nowIso;
      details.approvedBy = actor.name;
      history.push({ action: 'APPROVED', by: actor.name, actorId: actor.id, role: actor.role, timestamp: nowIso, notes: remarks });
    } else if (action === 'REJECT') {
      details.wardenRemarks = remarks || `Rejected by ${actor.name}`;
      details.rejectedAt = nowIso;
      history.push({ action: 'REJECTED', by: actor.name, actorId: actor.id, role: actor.role, timestamp: nowIso, notes: remarks });
    } else if (action === 'RECORD_EXIT') {
      details.actualExitTime = timeFormatted;
      history.push({ action: 'PHYSICAL_EXIT_LOGGED', by: actor.name, actorId: actor.id, role: actor.role, timestamp: nowIso });
    } else if (action === 'RECORD_RETURN') {
      details.actualReturnTime = timeFormatted;
      history.push({ action: 'CAMPUS_RETURN_LOGGED', by: actor.name, actorId: actor.id, role: actor.role, timestamp: nowIso });
    }

    const result = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'HOSTEL_GATE_PASS', status: transition.status },
      data: {
        status: transition.nextStatus,
        currentStage: transition.nextStatus,
        details,
        history,
      },
    });
    if (result.count !== 1) throw new ConflictException('Gate pass state changed concurrently. Refresh and retry.');
    return this.prisma.workflowRequest.findUnique({ where: { id } });
  }

  // ==========================================
  // 7. RECONCILED DASHBOARD METRICS
  // ==========================================
  async getHostelDashboardStats() {
    const hostels = await this.getHostels();
    const rooms = await this.getHostelRooms();
    const complaints = await this.getComplaints();
    const visitors = await this.getVisitors();
    const gatePasses = await this.getGatePasses();

    const totalHostels = hostels.length;
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const occupiedBeds = rooms.reduce((acc, room) => acc + room.occupied, 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100 * 10) / 10 : null;

    const pendingGatePasses = gatePasses.filter(p => p.status === 'Pending Warden Approval').length;
    const activeComplaints = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
    const activeVisitors = visitors.filter(v => v.outTime === 'Pending Sign-out' || !v.outTime).length;
    const overdueReturns = gatePasses.filter(p => p.isOverdue || (p.status === 'Exited' && p.inDateTime && new Date(p.inDateTime).getTime() < Date.now())).length;

    return {
      totalHostels,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyPercentage,
      pendingGatePasses,
      activeComplaints,
      activeVisitors,
      overdueReturns,
    };
  }

  // ==========================================
  // 8. RESIDENT DOCUMENTS REPOSITORY
  // ==========================================
  async getStudentDocuments(rollNumber?: string, requesterId?: string) {
    const where: any = { workflowType: 'HOSTEL_DOCUMENT' };
    if (requesterId) where.requesterId = requesterId;
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const documents = requests.map(r => {
      const d = (r.details as any) || {};
      return {
        id: r.id,
        studentName: r.requesterName,
        rollNumber: d.rollNumber || null,
        docType: d.docType || null,
        fileName: d.fileName || null,
        fileSize: d.fileSize || null,
        status: r.status,
        verifiedBy: d.verifiedBy || null,
        verifiedAt: d.verifiedAt || null,
        rejectionReason: d.rejectionReason || null,
        createdAt: r.createdAt.toISOString(),
      };
    });
    return rollNumber ? documents.filter((document) => document.rollNumber?.toLowerCase() === rollNumber.toLowerCase()) : documents;
  }

  async verifyDocument(id: string, status: 'Verified' | 'Rejected', reviewer = 'Chief Warden', notes?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Document record not found.');

    const details = (req.details as any) || {};
    details.verifiedBy = reviewer;
    details.verifiedAt = new Date().toISOString();
    if (status === 'Rejected') {
      details.rejectionReason = notes || 'Rejected by Warden Verification';
    }

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status,
        details,
      },
    });
  }
}
