import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRequisitionDto,
  ReviewRequisitionDto,
  IssueStockDto,
  CreateComplaintDto,
  ReviewComplaintDto,
  UpdateWorkOrderDto,
  RecordPracticalAttendanceDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto/laboratory.dto';

@Injectable()
export class LaboratoryService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialLabsIfEmpty();
  }

  // --- 1. SEED DEFAULT MULTI-BRANCH LABORATORIES & EQUIPMENT ---
  private async seedInitialLabsIfEmpty() {
    try {
      const labCount = await this.prisma.laboratory.count();
      if (labCount === 0) {
        const seedLabs = [
          // Biotechnology
          { code: 'BIOTECH-LAB-01', name: 'Genetic Engineering & Cell Culture Lab', department: 'BIOTECH', building: 'Bio Hub Block-G', room: 'Room 201', capacity: 35, assignedStaff: 'Ms. Swagatika Sahu', inChargeName: 'Dr. P. K. Panda' },
          { code: 'BIOTECH-LAB-02', name: 'Bioprocess & Fermentation Technology Lab', department: 'BIOTECH', building: 'Bio Hub Block-G', room: 'Room 204', capacity: 40, assignedStaff: 'Mr. B. K. Patra', inChargeName: 'Dr. R. K. Mishra' },
          // Computer Science & Engineering
          { code: 'CSE-LAB-01', name: 'Data Structures & Algorithms Laboratory', department: 'CSE', building: 'Turing Block-C', room: 'Room 101', capacity: 70, assignedStaff: 'Mr. Tushar K. Mishra', inChargeName: 'Prof. R. N. Mohanty' },
          { code: 'CSE-LAB-02', name: 'Systems & Network Engineering Lab', department: 'CSE', building: 'Turing Block-C', room: 'Room 202', capacity: 65, assignedStaff: 'Mr. Biswajit Sahoo', inChargeName: 'Dr. Alok Ranjan Nayak' },
          // CSE (AI)
          { code: 'AI-LAB-01', name: 'Deep Learning & Neural Computing Lab', department: 'CSE_AI', building: 'AI Block-E', room: 'Room 101', capacity: 45, assignedStaff: 'Mr. Biswajit Sahoo', inChargeName: 'Dr. Debasis Gountia' },
          { code: 'AI-LAB-02', name: 'Robotics & Computer Vision Lab', department: 'CSE_AI', building: 'AI Block-E', room: 'Room 202', capacity: 40, assignedStaff: 'Ms. Priyadarshini Jena', inChargeName: 'Dr. S. K. Swain' },
          // Electronics & Communication
          { code: 'ECE-LAB-01', name: 'VLSI & Digital Signal Processing Lab', department: 'ECE', building: 'Bose Block-B', room: 'Room 102', capacity: 50, assignedStaff: 'Mr. Subhashree Dash', inChargeName: 'Dr. P. Kabisatpathy' },
          { code: 'ECE-LAB-02', name: 'Communication & Microwave Engineering Lab', department: 'ECE', building: 'Bose Block-B', room: 'Room 203', capacity: 45, assignedStaff: 'Mr. Amitav Mohapatra', inChargeName: 'Dr. S. R. Pattnaik' },
          // Mechanical Engineering
          { code: 'MECH-LAB-01', name: 'Machine Tools & CNC Machining Workshop', department: 'MECH', building: 'Central Workshop Block-M', room: 'Bay 2', capacity: 55, assignedStaff: 'Mr. Rabindra N. Mallick', inChargeName: 'Dr. Arun Kumar Sahoo' },
          { code: 'MECH-LAB-02', name: 'Thermodynamics & Heat Transfer Lab', department: 'MECH', building: 'Central Workshop Block-M', room: 'Bay 4', capacity: 45, assignedStaff: 'Mr. K. C. Nayak', inChargeName: 'Dr. P. C. Jena' },
          // Civil Engineering
          { code: 'CIVIL-LAB-01', name: 'Concrete Technology & Material Testing Lab', department: 'CIVIL', building: 'Visvesvaraya Block-V', room: 'Room G-02', capacity: 45, assignedStaff: 'Mr. Binod Behera', inChargeName: 'Dr. S. K. Dash' },
          { code: 'CIVIL-LAB-02', name: 'Geotechnical & Soil Mechanics Lab', department: 'CIVIL', building: 'Visvesvaraya Block-V', room: 'Room 104', capacity: 40, assignedStaff: 'Mr. P. K. Rout', inChargeName: 'Dr. A. K. Nayak' },
          // Electrical Engineering
          { code: 'EEE-LAB-01', name: 'Power Systems & High Voltage Lab', department: 'EEE', building: 'Tesla Block-A', room: 'Room 105', capacity: 45, assignedStaff: 'Mr. Manoj K. Samal', inChargeName: 'Dr. B. P. Panigrahi' },
          { code: 'EEE-LAB-02', name: 'Electrical Machines & Power Electronics Lab', department: 'EEE', building: 'Tesla Block-A', room: 'Room 205', capacity: 50, assignedStaff: 'Mr. S. K. Mohanty', inChargeName: 'Dr. C. K. Panigrahi' },
        ];

        for (const lab of seedLabs) {
          await this.prisma.laboratory.create({ data: lab });
        }
      }

      // Seed equipment if empty
      const eqCount = await this.prisma.labEquipment.count();
      if (eqCount === 0) {
        const seedEquipment = [
          // BIOTECH
          { equipmentCode: 'EQ-BIO-001', equipmentName: 'Class II Biosafety Cabinet', category: 'Laminar Air Flow Workbenches', department: 'BIOTECH', labName: 'Genetic Engineering & Cell Culture Lab', labCode: 'BIOTECH-LAB-01', quantity: 2, availableQuantity: 2, issuedQuantity: 0, condition: 'Available', status: 'Available', unitPrice: 185000, purchaseInfo: 'PO-2024-BIO-12 | GeM', inCharge: 'Ms. Swagatika Sahu' },
          { equipmentCode: 'EQ-BIO-002', equipmentName: 'High-Speed Refrigerated Centrifuge', category: 'Centrifuges', department: 'BIOTECH', labName: 'Genetic Engineering & Cell Culture Lab', labCode: 'BIOTECH-LAB-01', quantity: 3, availableQuantity: 3, issuedQuantity: 0, condition: 'Available', status: 'Available', unitPrice: 240000, purchaseInfo: 'PO-2024-BIO-18 | Eppendorf', inCharge: 'Ms. Swagatika Sahu' },
          { equipmentCode: 'EQ-BIO-003', equipmentName: 'UV-Vis Double Beam Spectrophotometer', category: 'Spectrophotometers', department: 'BIOTECH', labName: 'Genetic Engineering & Cell Culture Lab', labCode: 'BIOTECH-LAB-01', quantity: 4, availableQuantity: 3, issuedQuantity: 1, condition: 'Available', status: 'Available', unitPrice: 320000, purchaseInfo: 'PO-2023-BIO-44 | Shimadzu', inCharge: 'Ms. Swagatika Sahu' },
          // CSE
          { equipmentCode: 'EQ-CSE-001', equipmentName: 'Dell Precision 3660 Tower Workstations', category: 'Workstations & PCs', department: 'CSE', labName: 'Systems & Network Engineering Lab', labCode: 'CSE-LAB-02', quantity: 65, availableQuantity: 64, issuedQuantity: 1, condition: 'Available', status: 'Available', unitPrice: 85000, purchaseInfo: 'PO-2024-CSE-01 | Dell Enterprise', inCharge: 'Mr. Biswajit Sahoo' },
          { equipmentCode: 'EQ-CSE-002', equipmentName: 'Cisco Catalyst 9200L 48-Port Switch', category: 'Networking & Racks', department: 'CSE', labName: 'Systems & Network Engineering Lab', labCode: 'CSE-LAB-02', quantity: 4, availableQuantity: 4, issuedQuantity: 0, condition: 'Available', status: 'Available', unitPrice: 145000, purchaseInfo: 'PO-2023-NET-08 | Cisco Systems', inCharge: 'Mr. Biswajit Sahoo' },
          { equipmentCode: 'EQ-CSE-003', equipmentName: 'APC Smart-UPS 10kVA On-Line Power Unit', category: 'Power Backup & UPS', department: 'CSE', labName: 'Systems & Network Engineering Lab', labCode: 'CSE-LAB-02', quantity: 2, availableQuantity: 1, issuedQuantity: 0, condition: 'Under Maintenance', status: 'Under Maintenance', unitPrice: 290000, purchaseInfo: 'PO-2022-PWR-04 | Schneider Electric', inCharge: 'Mr. Biswajit Sahoo' },
          // CSE_AI
          { equipmentCode: 'EQ-AI-001', equipmentName: 'NVIDIA RTX A6000 Deep Learning Workstation', category: 'GPU Computing Units', department: 'CSE_AI', labName: 'Deep Learning & Neural Computing Lab', labCode: 'AI-LAB-01', quantity: 12, availableQuantity: 12, issuedQuantity: 0, condition: 'Available', status: 'Available', unitPrice: 450000, purchaseInfo: 'PO-2025-AI-01 | NVIDIA Partner', inCharge: 'Mr. Biswajit Sahoo' },
          // ECE
          { equipmentCode: 'EQ-ECE-001', equipmentName: 'Keysight 200MHz Digital Storage Oscilloscope', category: 'Oscilloscopes', department: 'ECE', labName: 'VLSI & Digital Signal Processing Lab', labCode: 'ECE-LAB-01', quantity: 20, availableQuantity: 19, issuedQuantity: 1, condition: 'Available', status: 'Available', unitPrice: 95000, purchaseInfo: 'PO-2024-ECE-09 | Keysight', inCharge: 'Mr. Subhashree Dash' },
        ];

        for (const eq of seedEquipment) {
          await this.prisma.labEquipment.create({ data: eq });
        }
      }
    } catch (e: any) {
      console.warn('Initial laboratory seeding skipped / already populated:', e?.message);
    }
  }

  // --- 2. LABORATORIES DIRECTORY ---
  async getLaboratories(department?: string) {
    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department.toUpperCase();
    }
    return this.prisma.laboratory.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }

  async getLaboratoryByCode(code: string) {
    const lab = await this.prisma.laboratory.findUnique({
      where: { code },
    });
    if (!lab) {
      throw new NotFoundException(`Laboratory with code ${code} not found.`);
    }
    return lab;
  }

  // --- 3. EQUIPMENT & INVENTORY CRUD ---
  async getEquipment(department?: string, labCode?: string) {
    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department.toUpperCase();
    }
    if (labCode && labCode !== 'ALL') {
      where.labCode = labCode;
    }
    return this.prisma.labEquipment.findMany({
      where,
      orderBy: { equipmentCode: 'asc' },
    });
  }

  async createEquipment(dto: CreateEquipmentDto) {
    return this.prisma.labEquipment.create({
      data: {
        equipmentCode: dto.equipmentCode,
        equipmentName: dto.equipmentName,
        category: dto.category || 'Instruments',
        department: dto.department.toUpperCase(),
        labCode: dto.labCode,
        labName: dto.labName || dto.labCode,
        quantity: dto.quantity,
        availableQuantity: dto.quantity,
        issuedQuantity: 0,
        condition: dto.condition || 'Available',
        status: dto.condition || 'Available',
        unitPrice: dto.unitPrice || 0,
        purchaseInfo: dto.purchaseInfo,
      },
    });
  }

  async updateEquipment(id: string, dto: UpdateEquipmentDto) {
    return this.prisma.labEquipment.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteEquipment(id: string) {
    return this.prisma.labEquipment.delete({
      where: { id },
    });
  }

  // --- 4. INSTRUMENT REQUISITION WORKFLOW ---
  // Staff Lab -> Admin Review -> Approval -> Stock Issuance
  async getRequisitions(department?: string, status?: string) {
    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department.toUpperCase();
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    return this.prisma.labRequisition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRequisition(dto: CreateRequisitionDto, user: any) {
    const nextReqNumber = `REQ-${dto.department.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    return this.prisma.labRequisition.create({
      data: {
        requisitionNumber: nextReqNumber,
        department: dto.department.toUpperCase(),
        labCode: dto.labCode,
        equipmentName: dto.equipmentName,
        category: dto.category || 'Instruments',
        requestedQuantity: dto.requestedQuantity,
        estimatedCost: dto.estimatedCost || 0,
        urgency: dto.urgency || 'Normal',
        reason: dto.reason,
        requesterId: user.identifier || user.id || 'STF-OPS-09',
        requesterName: user.name || 'Mr. Biswajit Sahoo',
        requesterRole: user.role || 'STAFF',
        status: 'Submitted',
      },
    });
  }

  async reviewRequisition(id: string, dto: ReviewRequisitionDto, reviewer: any) {
    const req = await this.prisma.labRequisition.findUnique({ where: { id } });
    if (!req) {
      throw new NotFoundException(`Requisition ${id} not found.`);
    }

    const nextStatus = dto.action === 'APPROVE' ? 'Approved' : 'Rejected';
    const updated = await this.prisma.labRequisition.update({
      where: { id },
      data: {
        status: nextStatus,
        adminRemarks: dto.adminRemarks,
        reviewedBy: reviewer.name || 'Campus Administrator',
        reviewedAt: new Date(),
      },
    });

    await this.recordLabAuditLog({
      user: reviewer.name || 'Campus Administrator',
      role: reviewer.role || 'ADMIN',
      action: 'Review Lab Requisition',
      target: `Requisition #${req.requisitionNumber} (${req.equipmentName})`,
      oldValue: req.status,
      newValue: nextStatus,
      reason: dto.adminRemarks || 'Administrative Requisition Review',
      status: 'Success'
    });

    return updated;
  }

  async issueStock(id: string, dto: IssueStockDto, issuer: any) {
    const req = await this.prisma.labRequisition.findUnique({ where: { id } });
    if (!req) {
      throw new NotFoundException(`Requisition ${id} not found.`);
    }
    if (req.status !== 'Approved') {
      throw new BadRequestException(`Cannot issue stock for a requisition that is in "${req.status}" status. It must be Approved first.`);
    }

    // Try to find matching equipment in target laboratory to update quantity
    const matchingEq = await this.prisma.labEquipment.findFirst({
      where: {
        department: req.department,
        equipmentName: { contains: req.equipmentName, mode: 'insensitive' },
      },
    });

    if (matchingEq) {
      await this.prisma.labEquipment.update({
        where: { id: matchingEq.id },
        data: {
          quantity: matchingEq.quantity + dto.issuedQuantity,
          availableQuantity: matchingEq.availableQuantity + dto.issuedQuantity,
        },
      });
    }

    const issued = await this.prisma.labRequisition.update({
      where: { id },
      data: {
        status: 'Issued',
        issuedBy: issuer.name || 'Central Store Officer',
        issuedAt: new Date(),
        adminRemarks: dto.adminRemarks ? `${req.adminRemarks || ''} | Stock Issued: ${dto.adminRemarks}` : req.adminRemarks,
      },
    });

    await this.recordLabAuditLog({
      user: issuer.name || 'Central Store Officer',
      role: issuer.role || 'ADMIN',
      action: 'Issue Requisition Stock',
      target: `Requisition #${req.requisitionNumber} (${req.equipmentName})`,
      oldValue: 'Approved',
      newValue: `Issued (${dto.issuedQuantity} Units)`,
      reason: dto.adminRemarks || 'Physical Stock Provisioning & Inventory Increment',
      status: 'Success'
    });

    return issued;
  }

  // --- 5. EQUIPMENT REPAIR & COMPLAINTS WORKFLOW ---
  // Staff Lab -> Complaint -> Admin -> Approval -> Maintenance / Repair -> Completion
  async getComplaints(department?: string, status?: string) {
    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department.toUpperCase();
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    return this.prisma.labComplaintWorkOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComplaint(dto: CreateComplaintDto, user: any) {
    const nextCmpNumber = `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    
    // Automatically update equipment condition to 'Damaged' if equipmentCode provided
    if (dto.equipmentCode) {
      const eq = await this.prisma.labEquipment.findUnique({
        where: { equipmentCode: dto.equipmentCode },
      });
      if (eq) {
        await this.prisma.labEquipment.update({
          where: { equipmentCode: dto.equipmentCode },
          data: { condition: 'Damaged', status: 'Damaged' },
        });
      }
    }

    return this.prisma.labComplaintWorkOrder.create({
      data: {
        complaintNumber: nextCmpNumber,
        department: dto.department.toUpperCase(),
        labCode: dto.labCode,
        equipmentCode: dto.equipmentCode,
        equipmentName: dto.equipmentName,
        issueType: dto.issueType,
        priority: dto.priority || 'Medium',
        description: dto.description,
        photoUrl: dto.photoUrl,
        reporterId: user.identifier || user.id || 'STF-OPS-09',
        reporterName: user.name || 'Mr. Biswajit Sahoo',
        reporterRole: user.role || 'STAFF',
        status: 'Submitted',
      },
    });
  }

  async reviewComplaint(id: string, dto: ReviewComplaintDto, reviewer: any) {
    const cmp = await this.prisma.labComplaintWorkOrder.findUnique({ where: { id } });
    if (!cmp) {
      throw new NotFoundException(`Complaint ticket ${id} not found.`);
    }

    if (dto.action === 'APPROVE') {
      const workOrderNum = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      
      // Update equipment condition to Under Maintenance
      if (cmp.equipmentCode) {
        await this.prisma.labEquipment.updateMany({
          where: { equipmentCode: cmp.equipmentCode },
          data: { condition: 'Under Maintenance', status: 'Under Maintenance' },
        });
      }

      const updated = await this.prisma.labComplaintWorkOrder.update({
        where: { id },
        data: {
          status: dto.assignedTechnician ? 'Assigned' : 'Approved',
          workOrderNumber: workOrderNum,
          assignedTechnician: dto.assignedTechnician,
          assignedAt: dto.assignedTechnician ? new Date() : null,
          adminRemarks: dto.adminRemarks,
        },
      });

      await this.recordLabAuditLog({
        user: reviewer.name || 'Campus Administrator',
        role: reviewer.role || 'ADMIN',
        action: 'Approve Complaint & Issue Work Order',
        target: `Complaint #${cmp.complaintNumber} (${cmp.equipmentName})`,
        oldValue: cmp.status,
        newValue: updated.status,
        reason: dto.adminRemarks || 'Work Order Authorization',
        status: 'Success'
      });

      return updated;
    } else {
      const rejected = await this.prisma.labComplaintWorkOrder.update({
        where: { id },
        data: {
          status: 'Rejected',
          adminRemarks: dto.adminRemarks,
        },
      });

      await this.recordLabAuditLog({
        user: reviewer.name || 'Campus Administrator',
        role: reviewer.role || 'ADMIN',
        action: 'Reject Equipment Complaint',
        target: `Complaint #${cmp.complaintNumber} (${cmp.equipmentName})`,
        oldValue: cmp.status,
        newValue: 'Rejected',
        reason: dto.adminRemarks || 'Administrative Rejection',
        status: 'Success'
      });

      return rejected;
    }
  }

  async updateWorkOrder(id: string, dto: UpdateWorkOrderDto, user: any) {
    const cmp = await this.prisma.labComplaintWorkOrder.findUnique({ where: { id } });
    if (!cmp) {
      throw new NotFoundException(`Work order ${id} not found.`);
    }

    const updates: any = {
      status: dto.status,
      resolutionNotes: dto.resolutionNotes,
    };

    if (dto.status === 'Completed') {
      updates.completedAt = new Date();
      // Restore equipment condition to Available
      if (cmp.equipmentCode) {
        await this.prisma.labEquipment.updateMany({
          where: { equipmentCode: cmp.equipmentCode },
          data: { condition: 'Available', status: 'Available' },
        });
      }
    } else if (dto.status === 'Closed') {
      updates.closedAt = new Date();
    }

    const updated = await this.prisma.labComplaintWorkOrder.update({
      where: { id },
      data: updates,
    });

    await this.recordLabAuditLog({
      user: user.name || 'Central Maintenance Specialist',
      role: user.role || 'STAFF',
      action: 'Update Work Order Status',
      target: `Work Order #${cmp.workOrderNumber || cmp.id} (${cmp.equipmentName})`,
      oldValue: cmp.status,
      newValue: dto.status,
      reason: dto.resolutionNotes || 'Maintenance progress update',
      status: 'Success'
    });

    return updated;
  }

  // --- 6. PRACTICAL SESSIONS & ATTENDANCE ---
  async getSessions(department?: string, labCode?: string, date?: string) {
    const where: any = {};
    if (department && department !== 'ALL') {
      where.department = department.toUpperCase();
    }
    if (labCode && labCode !== 'ALL') {
      where.labCode = labCode;
    }
    if (date) {
      where.sessionDate = date;
    }
    return this.prisma.labPracticalSession.findMany({
      where,
      orderBy: { timeSlot: 'asc' },
    });
  }

  async recordAttendance(sessionId: string, dto: RecordPracticalAttendanceDto) {
    const session = await this.prisma.labPracticalSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException(`Practical session ${sessionId} not found.`);
    }

    return this.prisma.labPracticalSession.update({
      where: { id: sessionId },
      data: {
        presentStudents: dto.presentStudents,
        attendanceTaken: true,
        status: 'Completed',
      },
    });
  }

  // --- 7. ADMIN / SUPER ADMIN SUMMARY ---
  async getAdminSummary() {
    const [totalLabs, totalEquipment, underMaintenance, damaged, pendingRequisitions, openWorkOrders] = await Promise.all([
      this.prisma.laboratory.count(),
      this.prisma.labEquipment.count(),
      this.prisma.labEquipment.count({ where: { condition: 'Under Maintenance' } }),
      this.prisma.labEquipment.count({ where: { condition: 'Damaged' } }),
      this.prisma.labRequisition.count({ where: { status: { in: ['Submitted', 'Pending Admin Review'] } } }),
      this.prisma.labComplaintWorkOrder.count({ where: { status: { in: ['Submitted', 'Pending Admin Approval', 'Approved', 'Assigned', 'In Progress'] } } }),
    ]);

    const laboratories = await this.prisma.laboratory.findMany();
    const branchStats: Record<string, { labs: number; equipment: number }> = {};

    laboratories.forEach(l => {
      if (!branchStats[l.department]) {
        branchStats[l.department] = { labs: 0, equipment: 0 };
      }
      branchStats[l.department].labs++;
    });

    const equipmentList = await this.prisma.labEquipment.findMany();
    equipmentList.forEach(e => {
      if (branchStats[e.department]) {
        branchStats[e.department].equipment++;
      }
    });

    return {
      totalLabs,
      totalEquipment,
      availableEquipment: totalEquipment - underMaintenance - damaged,
      underMaintenance,
      damaged,
      pendingRequisitions,
      openWorkOrders,
      branchStats,
    };
  }

  // --- 8. AUDIT TRAIL LOGGING ---
  async recordLabAuditLog(data: {
    user: string;
    role: string;
    action: string;
    target: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
    status?: string;
    ipAddress?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          user: data.user,
          role: data.role,
          action: data.action,
          target: data.target,
          oldValue: data.oldValue || null,
          newValue: data.newValue || null,
          reason: data.reason || 'Laboratory operations audit trail',
          changedAt: new Date().toISOString(),
          status: data.status || 'Success',
          ipAddress: data.ipAddress || '192.168.1.1',
        },
      });
    } catch (e) {
      console.warn('AuditLog persistence warning:', e);
      return null;
    }
  }

  async getAuditLogs(role?: string, action?: string) {
    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }
    if (action && action !== 'ALL') {
      where.action = { contains: action, mode: 'insensitive' };
    }
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
