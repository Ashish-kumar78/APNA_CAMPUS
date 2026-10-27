import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding enhanced hostel complaints into PostgreSQL...');
  await prisma.hostelComplaint.deleteMany();
  await prisma.hostelComplaint.createMany({
    data: [
      {
        id: 'CMP-2026-101',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Room 204 Attached Bathroom',
        category: 'Plumbing',
        predictedCategory: 'plumbing',
        confidence: 0.88,
        needsReview: false,
        title: 'Water tap leaking continuously in bathroom',
        description: 'The bathroom wash basin tap is broken at the valve and dripping water constantly.',
        priority: 'High',
        status: 'In Progress',
        assignedStaffId: 'STF-PLUMB-01',
        assignedStaffName: 'Suresh Mohapatra',
        assignedStaffPhone: '+91 94379 11231',
        assignedStaffRole: 'Plumber & Water Works',
        assignedAt: new Date(Date.now() - 3600000 * 24),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 48), // 48 hours remaining
        isEscalated: false,
        filedDate: '10 Oct 2026',
        resolutionNotes: 'Assigned to Suresh Mohapatra. Replacement ceramic washer scheduled for 11:30 AM.',
        statusHistory: [
          { id: 'h-101-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), remarks: 'Complaint registered. Routed to Warden Mrs. Nibedita Das. 72h deadline set.' },
          { id: 'h-101-2', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Suresh Mohapatra', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), remarks: 'Work execution started. Replacement parts procured.' }
        ]
      },
      {
        id: 'CMP-2026-102',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Study Area Desk #02',
        category: 'Electrical',
        predictedCategory: 'electrical',
        confidence: 0.82,
        needsReview: false,
        title: 'Ceiling fan making screeching noise',
        description: 'The ceiling fan bearing has deteriorated and makes a loud squeaking sound on speed 4 and 5.',
        priority: 'Medium',
        status: 'Assigned',
        assignedStaffId: 'STF-ELEC-01',
        assignedStaffName: 'Pramod Panda',
        assignedStaffPhone: '+91 94378 99120',
        assignedStaffRole: 'Electrician & Power Maintenance',
        assignedAt: new Date(Date.now() - 3600000 * 4),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 68), // 68 hours remaining
        isEscalated: false,
        filedDate: '10 Oct 2026',
        resolutionNotes: 'Allocated to Pramod Panda based on lowest pending electrical workload.',
        statusHistory: [
          { id: 'h-102-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), remarks: 'Complaint submitted and auto-assigned.' }
        ]
      },
      {
        id: 'CMP-2026-103',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Balcony Door Hinge',
        category: 'Civil',
        predictedCategory: 'civil',
        confidence: 0.94,
        needsReview: false,
        title: 'Balcony door latch loose and rattling',
        description: 'Metal latch bracket screws came loose in high winds and the latch rattles continuously.',
        priority: 'Medium',
        status: 'Awaiting Student Verification',
        assignedStaffId: 'STF-CARP-01',
        assignedStaffName: 'Manoj Kumar Barik',
        assignedStaffPhone: '+91 94379 77210',
        assignedStaffRole: 'Carpentry & Metal Works',
        assignedAt: new Date(Date.now() - 3600000 * 30),
        workCompletedAt: new Date(Date.now() - 3600000 * 2),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 42),
        isEscalated: false,
        filedDate: '09 Oct 2026',
        resolutionNotes: 'Replaced anchor screws and aligned striker plate. Awaiting student verification.',
        statusHistory: [
          { id: 'h-103-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-103-2', fromStatus: 'Assigned', toStatus: 'In Progress', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), remarks: 'Inspected and repaired.' },
          { id: 'h-103-3', fromStatus: 'In Progress', toStatus: 'Awaiting Student Verification', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), remarks: 'Work marked complete by technician. Sent student verification prompt.' }
        ]
      },
      {
        id: 'CMP-2026-104',
        studentName: 'Amit Nayak',
        rollNumber: '02',
        hostel: 'Gandhi Boys Residence',
        roomNumber: '102',
        location: 'Room 102 Electrical Switchboard',
        category: 'Electrical',
        predictedCategory: 'electrical',
        confidence: 0.95,
        needsReview: false,
        title: 'Geyser MCB trip circuit breaker burning smell',
        description: 'Frequent tripping of geyser 16A circuit breaker with mild burning insulation smell.',
        priority: 'High',
        status: 'Escalated',
        assignedStaffId: 'STF-ELEC-01',
        assignedStaffName: 'Pramod Panda',
        assignedStaffPhone: '+91 94378 99120',
        assignedStaffRole: 'Electrician & Power Maintenance',
        assignedAt: new Date(Date.now() - 3600000 * 80),
        assignedWardenId: 'WRD-B01',
        assignedWardenName: 'Mr. Rajesh Jena',
        assignedWardenContact: '+91 94370 11223',
        resolutionDeadline: new Date(Date.now() - 3600000 * 8), // Overdue by 8 hours
        isEscalated: true,
        escalatedAt: new Date(Date.now() - 3600000 * 8),
        escalationReason: 'Resolution deadline (72 hours) exceeded without verified completion',
        filedDate: '07 Oct 2026',
        resolutionNotes: 'Escalated to Hostel Administrator due to deadline expiry. Urgent breaker replacement needed.',
        statusHistory: [
          { id: 'h-104-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Amit Nayak', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 80).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-104-2', fromStatus: 'Assigned', toStatus: 'Escalated', changedBy: 'System Escalation Daemon', role: 'SYSTEM', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), remarks: 'Automatically escalated to Hostel Administrator: 72-hour mandatory deadline exceeded.' }
        ]
      },
      {
        id: 'CMP-2026-105',
        studentName: 'Rakesh Das',
        rollNumber: '01',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Room 204 Study Desk',
        category: 'Furniture',
        predictedCategory: 'furniture',
        confidence: 0.91,
        needsReview: false,
        title: 'Study chair hydraulic cylinder sinking',
        description: 'Height adjustment lever slips downward when seated.',
        priority: 'Medium',
        status: 'Resolved',
        assignedStaffId: 'STF-CARP-01',
        assignedStaffName: 'Manoj Kumar Barik',
        assignedStaffPhone: '+91 94379 77210',
        assignedStaffRole: 'Carpentry & Metal Works',
        assignedAt: new Date(Date.now() - 3600000 * 48),
        workCompletedAt: new Date(Date.now() - 3600000 * 20),
        studentVerifiedAt: new Date(Date.now() - 3600000 * 18),
        resolvedAt: new Date(Date.now() - 3600000 * 18),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 24),
        isEscalated: false,
        feedbackRating: 5,
        feedbackText: 'Technician promptly replaced the hydraulic cylinder with a brand new unit. Excellent service!',
        feedbackResolved: true,
        feedbackAdminComments: 'Resolved within 24 hours. Very courteous worker.',
        feedbackSubmittedAt: new Date(Date.now() - 3600000 * 18),
        filedDate: '06 Oct 2026',
        resolutionNotes: 'New gas cylinder installed. Student confirmed satisfactory repair.',
        statusHistory: [
          { id: 'h-105-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-105-2', fromStatus: 'Assigned', toStatus: 'Awaiting Student Verification', changedBy: 'Manoj Kumar Barik', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 20).toISOString(), remarks: 'Replaced gas cylinder.' },
          { id: 'h-105-3', fromStatus: 'Awaiting Student Verification', toStatus: 'Resolved', changedBy: 'Rakesh Das', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), remarks: 'Student confirmed completion with 5-star rating.' }
        ]
      },
      {
        id: 'CMP-2026-106',
        studentName: 'Priya Patra',
        rollNumber: '04',
        hostel: 'Sarojini Girls Residence (Block A)',
        roomNumber: '204',
        location: 'Study Area Desk #01',
        category: 'Network',
        predictedCategory: 'network',
        confidence: 0.89,
        needsReview: false,
        title: 'Floor Wi-Fi access point dropping packets',
        description: 'Repeated signal disconnections during online technical assessment tests.',
        priority: 'High',
        status: 'Reopened',
        assignedStaffId: 'STF-IT-01',
        assignedStaffName: 'Tapan Kumar Mohapatra',
        assignedStaffPhone: '+91 94382 44564',
        assignedStaffRole: 'Senior Lab & Network Technician',
        assignedAt: new Date(Date.now() - 3600000 * 36),
        assignedWardenId: 'WRD-G01',
        assignedWardenName: 'Mrs. Nibedita Das',
        assignedWardenContact: '+91 94370 33445',
        resolutionDeadline: new Date(Date.now() + 3600000 * 36),
        isEscalated: false,
        reopenedAt: new Date(Date.now() - 3600000 * 3),
        reopenReason: 'Re-occurred within 2 hours of restart. Channel congestion on 2.4 GHz band remains.',
        filedDate: '08 Oct 2026',
        resolutionNotes: 'Ticket reopened by student. Network team dispatched with dual-band 5GHz extender.',
        statusHistory: [
          { id: 'h-106-1', fromStatus: null, toStatus: 'Assigned', changedBy: 'Priya Patra', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 36).toISOString(), remarks: 'Complaint submitted.' },
          { id: 'h-106-2', fromStatus: 'Assigned', toStatus: 'Awaiting Student Verification', changedBy: 'Tapan Kumar Mohapatra', role: 'STAFF', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), remarks: 'Router rebooted.' },
          { id: 'h-106-3', fromStatus: 'Awaiting Student Verification', toStatus: 'Reopened', changedBy: 'Priya Patra', role: 'STUDENT', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), remarks: 'Problem reported not resolved by student: Channel congestion persists.' }
        ]
      }
    ],
  });
  console.log('Successfully seeded 6 complaint records across all workflow states!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
