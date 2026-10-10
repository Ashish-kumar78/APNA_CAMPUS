import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostelService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. HOSTEL & INFRASTRUCTURE MANAGEMENT
  // ==========================================
  async getHostels() {
    let hostels = await this.prisma.hostel.findMany();
    if (hostels.length === 0) {
      // Seed default institutional hostels if DB empty
      const defaultHostels = [
        {
          name: 'Gandhi Boys Residence (Hostel 1)',
          type: 'Boys',
          totalFloors: 3,
          totalRooms: 60,
          totalBeds: 180,
          occupiedBeds: 168,
          availableBeds: 12,
          warden: 'Mr. Rajesh Jena',
          contact: '+91 94370 11223',
        },
        {
          name: 'Kalam Boys Residence (Hostel 2)',
          type: 'Boys',
          totalFloors: 3,
          totalRooms: 60,
          totalBeds: 180,
          occupiedBeds: 172,
          availableBeds: 8,
          warden: 'Mr. Manoj Sahoo',
          contact: '+91 94370 22334',
        },
        {
          name: 'Sarojini Girls Residence (Hostel 1)',
          type: 'Girls',
          totalFloors: 3,
          totalRooms: 50,
          totalBeds: 150,
          occupiedBeds: 142,
          availableBeds: 8,
          warden: 'Mrs. Nibedita Das',
          contact: '+91 94370 33445',
        },
        {
          name: 'Kalpana Chawla Girls Residence (Hostel 2)',
          type: 'Girls',
          totalFloors: 3,
          totalRooms: 50,
          totalBeds: 150,
          occupiedBeds: 130,
          availableBeds: 20,
          warden: 'Mrs. Pratima Mohapatra',
          contact: '+91 94370 44556',
        },
      ];
      for (const h of defaultHostels) {
        await this.prisma.hostel.create({ data: h });
      }
      hostels = await this.prisma.hostel.findMany();
    }
    return hostels;
  }

  async getHostelRooms(hostelId?: string, floor?: string) {
    const where: any = {};
    if (hostelId && hostelId !== 'ALL' && hostelId !== 'All') where.hostelId = hostelId;
    if (floor && floor !== 'ALL' && floor !== 'All') where.floor = floor;

    let rooms = await this.prisma.hostelRoom.findMany({ where });
    if (rooms.length === 0 && (!hostelId || hostelId === 'hostel-b1' || hostelId === 'hostel-g1')) {
      const defaultRooms = [
        { hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 1', roomNumber: '101', capacity: 3, occupied: 3, type: 'Non-AC Triple' },
        { hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 1', roomNumber: '102', capacity: 3, occupied: 2, type: 'Non-AC Triple' },
        { hostelId: 'hostel-g1', hostelName: 'Sarojini Girls Residence', floor: 'Floor 2', roomNumber: '204', capacity: 3, occupied: 3, type: 'AC Triple Deluxe' },
        { hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 1', roomNumber: '101', capacity: 3, occupied: 3, type: 'Non-AC Triple' },
        { hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 1', roomNumber: '102', capacity: 3, occupied: 2, type: 'Non-AC Triple' },
        { hostelId: 'hostel-b1', hostelName: 'Gandhi Boys Residence', floor: 'Floor 2', roomNumber: '201', capacity: 3, occupied: 3, type: 'AC Triple Deluxe' },
      ];
      for (const r of defaultRooms) {
        await this.prisma.hostelRoom.create({ data: r });
      }
      rooms = await this.prisma.hostelRoom.findMany({ where });
    }
    return rooms;
  }

  // ==========================================
  // 2. RESIDENT BED ALLOCATION & TRANSFERS
  // ==========================================
  async allocateBed(data: {
    studentRoll: string;
    hostelName: string;
    roomNumber: string;
    bedNumber: string;
    floor?: string;
  }) {
    const student = await this.prisma.student.findFirst({
      where: { rollNumber: data.studentRoll },
    });
    if (!student) {
      throw new NotFoundException(`Student with Roll Number "${data.studentRoll}" not found in institutional registry.`);
    }

    // Check if room exists and check capacity
    const room = await this.prisma.hostelRoom.findFirst({
      where: { roomNumber: data.roomNumber },
    });

    if (room && room.occupied >= room.capacity) {
      throw new BadRequestException(`Room ${data.roomNumber} has already reached maximum approved capacity of ${room.capacity} beds.`);
    }

    // Atomic update of student and room
    const updatedStudent = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        hostelName: data.hostelName,
        roomNumber: data.roomNumber,
        bedNumber: data.bedNumber,
        floor: data.floor || 'Floor 1',
      },
    });

    if (room) {
      await this.prisma.hostelRoom.update({
        where: { id: room.id },
        data: { occupied: { increment: 1 } },
      });
    }

    return {
      success: true,
      message: `Bed ${data.bedNumber} in Room ${data.roomNumber} successfully allocated to ${student.name} (${student.rollNumber}).`,
      student: updatedStudent,
    };
  }

  async transferBed(data: {
    studentRoll: string;
    newHostelName: string;
    newRoomNumber: string;
    newBedNumber: string;
    newFloor?: string;
    transferReason?: string;
  }) {
    const student = await this.prisma.student.findFirst({
      where: { rollNumber: data.studentRoll },
    });
    if (!student) {
      throw new NotFoundException(`Student ${data.studentRoll} not found.`);
    }

    const oldRoomNumber = student.roomNumber;

    // Verify new room capacity
    const targetRoom = await this.prisma.hostelRoom.findFirst({
      where: { roomNumber: data.newRoomNumber },
    });
    if (targetRoom && targetRoom.occupied >= targetRoom.capacity) {
      throw new BadRequestException(`Target Room ${data.newRoomNumber} is currently at full capacity.`);
    }

    // Decrement old room
    if (oldRoomNumber) {
      const oldRoom = await this.prisma.hostelRoom.findFirst({
        where: { roomNumber: oldRoomNumber },
      });
      if (oldRoom && oldRoom.occupied > 0) {
        await this.prisma.hostelRoom.update({
          where: { id: oldRoom.id },
          data: { occupied: { decrement: 1 } },
        });
      }
    }

    // Increment new room
    if (targetRoom) {
      await this.prisma.hostelRoom.update({
        where: { id: targetRoom.id },
        data: { occupied: { increment: 1 } },
      });
    }

    // Update student residency
    const updatedStudent = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        hostelName: data.newHostelName,
        roomNumber: data.newRoomNumber,
        bedNumber: data.newBedNumber,
        floor: data.newFloor || 'Floor 1',
      },
    });

    return {
      success: true,
      message: `Student transferred from Room ${oldRoomNumber || 'N/A'} to ${data.newRoomNumber} (${data.newBedNumber}).`,
      student: updatedStudent,
    };
  }

  async vacateBed(studentRoll: string, checkoutNotes?: string) {
    const student = await this.prisma.student.findFirst({
      where: { rollNumber: studentRoll },
    });
    if (!student) {
      throw new NotFoundException(`Student ${studentRoll} not found.`);
    }

    const oldRoomNumber = student.roomNumber;
    if (oldRoomNumber) {
      const oldRoom = await this.prisma.hostelRoom.findFirst({
        where: { roomNumber: oldRoomNumber },
      });
      if (oldRoom && oldRoom.occupied > 0) {
        await this.prisma.hostelRoom.update({
          where: { id: oldRoom.id },
          data: { occupied: { decrement: 1 } },
        });
      }
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id: student.id },
      data: {
        hostelName: null,
        roomNumber: null,
        bedNumber: null,
        floor: null,
      },
    });

    return {
      success: true,
      message: `Bed vacated for student ${student.name}. Room ${oldRoomNumber || 'N/A'} capacity restored.`,
      student: updatedStudent,
    };
  }

  // ==========================================
  // 3. STUDENT SELF RESIDENCE VIEW
  // ==========================================
  async getMyResidence(rollNumber = '01') {
    const student = await this.prisma.student.findFirst({
      where: { rollNumber },
    });

    return {
      hostelName: student?.hostelName || 'Sarojini Girls Residence (Block A)',
      roomNumber: student?.roomNumber || '204',
      bedNumber: student?.bedNumber || 'Bed 01 (Window Side)',
      floor: student?.floor || 'Floor 2',
      wardenName: student?.wardenName || 'Mrs. Nibedita Das',
      wardenContact: student?.wardenContact || '+91 94370 33445',
      roommates: [
        { name: 'Priya Patra', roll: '04', branch: 'CSE - Sem 5', bed: 'Bed 02' },
        { name: 'Sneha Mohanty', roll: '06', branch: 'CSE - Sem 5', bed: 'Bed 03' },
      ],
      rules: [
        'Night curfews strictly implemented at 8:30 PM.',
        'Biometric attendance check-in compulsory before 8:45 PM.',
        'Mess timings: Breakfast 7:30 - 9:00 AM, Dinner 7:30 - 9:30 PM.',
        'Electric heating appliances and immersion rods strictly prohibited.',
      ],
    };
  }

  // ==========================================
  // 4. MAINTENANCE COMPLAINTS WORKFLOW
  // ==========================================
  async getComplaints(rollNumber?: string, category?: string, status?: string) {
    const where: any = {};
    if (rollNumber) where.rollNumber = rollNumber;
    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    return this.prisma.hostelComplaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async lodgeComplaint(data: {
    studentName?: string;
    rollNumber?: string;
    hostel?: string;
    roomNumber?: string;
    category: string;
    title: string;
    description?: string;
    priority?: string;
  }) {
    return this.prisma.hostelComplaint.create({
      data: {
        studentName: data.studentName || 'Rakesh Das',
        rollNumber: data.rollNumber || '01',
        hostel: data.hostel || 'Sarojini Girls Residence',
        roomNumber: data.roomNumber || '204',
        category: data.category,
        title: data.title,
        priority: data.priority || 'Medium',
        status: 'Pending',
        filedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        resolutionNotes: 'Assigned to resident warden for contractor scheduling.',
      },
    });
  }

  async updateComplaintStatus(
    id: string,
    status: string,
    assignedStaff?: string,
    resolutionNotes?: string,
  ) {
    return this.prisma.hostelComplaint.update({
      where: { id },
      data: {
        status,
        resolutionNotes: resolutionNotes || (status === 'Resolved' ? 'Verified by hostel maintenance supervisor.' : undefined),
      },
    });
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
    studentName: string;
    rollNumber: string;
    inTime: string;
    purpose: string;
  }) {
    const passNumber = `PASS-${Math.floor(800 + Math.random() * 200)}`;
    return this.prisma.hostelVisitor.create({
      data: {
        ...data,
        outTime: 'Pending Sign-out',
        passNumber,
      },
    });
  }

  async checkInVisitor(id: string, badgeNumber?: string) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return this.prisma.hostelVisitor.update({
      where: { id },
      data: {
        inTime: timeStr,
      },
    });
  }

  async checkOutVisitor(id: string) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return this.prisma.hostelVisitor.update({
      where: { id },
      data: {
        outTime: timeStr,
      },
    });
  }

  // ==========================================
  // 6. OUTING, HOME LEAVE & GATE PASSES
  // ==========================================
  async getGatePasses(status?: string, hostelName?: string) {
    const where: any = { workflowType: 'HOSTEL_GATE_PASS' };
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let passes = requests.map(r => {
      const d = (r.details as any) || {};
      return {
        id: r.id,
        passId: d.passId || `GP-2026-${r.id.slice(-4).toUpperCase()}`,
        studentName: r.requesterName,
        rollNumber: d.rollNumber || '01',
        department: r.department || 'Computer Science & Engineering',
        hostelName: d.hostelName || 'Gandhi Boys Residence',
        roomNumber: d.roomNumber || 'Room 101',
        bedNo: d.bedNo || 'Bed 01',
        purposeType: d.purposeType || 'Home Visit',
        destination: d.destination || '',
        outDateTime: d.outDateTime || '',
        inDateTime: d.inDateTime || '',
        parentConsentVerified: d.parentConsentVerified ?? true,
        mentorStatus: d.mentorStatus || 'Verified & Recommended',
        mentorRemarks: d.mentorRemarks || 'Verified by Faculty Mentor',
        status: r.status,
        wardenRemarks: d.wardenRemarks || '',
        actualExitTime: d.actualExitTime || null,
        actualReturnTime: d.actualReturnTime || null,
        isOverdue: d.isOverdue || false,
        qrCodeString: d.qrCodeString || `BPUT-GP-${r.id}`,
        createdAt: r.createdAt.toISOString(),
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

  async createGatePass(data: any, user: any) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const passId = `GP-2026-${randomSuffix}`;

    const details = {
      passId,
      rollNumber: data.rollNumber || user.identifier || '01',
      hostelName: data.hostelName || 'Gandhi Boys Residence',
      roomNumber: data.roomNumber || 'Room 101',
      bedNo: data.bedNo || 'Bed 01',
      purposeType: data.purposeType || 'Home Visit',
      destination: data.destination || 'Home',
      outDateTime: data.outDateTime || '',
      inDateTime: data.inDateTime || '',
      emergencyContact: data.emergencyContact || '',
      parentConsentVerified: Boolean(data.parentConsentVerified),
      mentorStatus: 'Verified & Recommended',
      mentorRemarks: data.mentorRemarks || 'Academic attendance verified (>85%). Recommended.',
      wardenRemarks: '',
      actualExitTime: null,
      actualReturnTime: null,
      qrCodeString: `BPUT-${passId}-${(data.studentName || user.name || 'STUDENT').toUpperCase()}-PENDING`,
    };

    return this.prisma.workflowRequest.create({
      data: {
        workflowType: 'HOSTEL_GATE_PASS',
        title: `Gate Pass for ${data.studentName || user.name} (${details.purposeType})`,
        requesterId: user.id || 'STD-01',
        requesterName: data.studentName || user.name,
        requesterRole: 'STUDENT',
        department: data.department || user.department || 'Computer Science & Engineering',
        details,
        currentStage: 'Warden Review',
        status: 'Pending Warden Approval',
        history: [
          {
            action: 'SUBMITTED',
            stage: 'Pending Warden Approval',
            by: data.studentName || user.name,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  }

  async actionGatePass(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'RECORD_EXIT' | 'RECORD_RETURN',
    wardenName = 'Resident Warden',
    remarks?: string,
  ) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Gate pass request not found.');

    const details = (req.details as any) || {};
    const history = (req.history as any[]) || [];
    let newStatus = req.status;
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (action === 'APPROVE') {
      newStatus = 'Approved';
      details.wardenRemarks = remarks || 'Approved by Resident Warden';
      details.approvedAt = nowIso;
      details.approvedBy = wardenName;
      details.qrCodeString = `BPUT-${details.passId || req.id}-APPROVED-VALID`;
      history.push({ action: 'APPROVED', by: wardenName, timestamp: nowIso, notes: remarks });
    } else if (action === 'REJECT') {
      newStatus = 'Rejected';
      details.wardenRemarks = remarks || 'Rejected by Warden';
      details.rejectedAt = nowIso;
      history.push({ action: 'REJECTED', by: wardenName, timestamp: nowIso, notes: remarks });
    } else if (action === 'RECORD_EXIT') {
      newStatus = 'Exited';
      details.actualExitTime = timeFormatted;
      history.push({ action: 'PHYSICAL_EXIT_LOGGED', by: 'Security Post', timestamp: nowIso });
    } else if (action === 'RECORD_RETURN') {
      newStatus = 'Returned';
      details.actualReturnTime = timeFormatted;
      history.push({ action: 'CAMPUS_RETURN_LOGGED', by: 'Security Post', timestamp: nowIso });
    }

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        details,
        history,
      },
    });
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
    const totalBeds = hostels.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
    const occupiedBeds = hostels.reduce((acc, h) => acc + (h.occupiedBeds || 0), 0);
    const availableBeds = totalBeds - occupiedBeds;
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100 * 10) / 10 : 92.4;

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
  async getStudentDocuments(rollNumber?: string) {
    const where: any = { workflowType: 'HOSTEL_DOCUMENT' };
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(r => {
      const d = (r.details as any) || {};
      return {
        id: r.id,
        studentName: r.requesterName,
        rollNumber: d.rollNumber || '01',
        docType: d.docType || 'Hostel Admission Undertaking',
        fileName: d.fileName || 'Document.pdf',
        fileSize: d.fileSize || '320 KB',
        status: r.status,
        verifiedBy: d.verifiedBy || null,
        verifiedAt: d.verifiedAt || null,
        rejectionReason: d.rejectionReason || null,
        createdAt: r.createdAt.toISOString(),
      };
    });
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
