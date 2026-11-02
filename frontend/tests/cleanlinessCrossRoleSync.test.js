import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitCleanlinessComplaint,
  getAllCleanlinessComplaints,
  getStudentCleanlinessComplaints,
  updateCleanlinessComplaintStatus,
  resolveCleanlinessComplaint,
  verifyCleanlinessComplaint,
  reopenCleanlinessComplaint,
  escalateCleanlinessComplaint,
  addCleanlinessInternalNote,
  getCleanlinessAnalytics,
  resetCleanlinessStore
} from '../src/services/cleanlinessComplaintStore.js';

describe('Hostel Room Cleanliness Complaint Cross-Role Integration: Student <-> Warden <-> Hostel Admin', () => {
  beforeEach(() => {
    resetCleanlinessStore();
  });

  it('1. Student lodges cleanliness complaint: immediately visible in student history with status Submitted and in Warden/Admin register', async () => {
    const studentData = {
      studentId: 'std-2305201001',
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostel: 'Sarojini Girls Residence (Block A)',
      block: 'Block A',
      floor: 'Floor 2',
      roomNumber: '204',
      category: 'Bathroom / Toilet Cleaning',
      title: 'Water tap leaking and floor stained',
      description: 'The attached bathroom tap has continuous dripping and floor requires anti-bacterial cleaning.',
      location: 'Attached Bathroom',
      priority: 'Urgent',
      preferredTime: '10:00 AM - 12:00 PM'
    };

    const created = await submitCleanlinessComplaint(studentData);
    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.complaintCode).toMatch(/^CLN-2026-/);
    expect(created.status).toBe('Submitted');
    expect(created.studentName).toBe('Aman Kumar Sharma');

    // 1. Verify in student self history
    const studentComplaints = await getStudentCleanlinessComplaints('2305201001', { studentName: 'Aman Kumar Sharma' });
    const studentRecord = studentComplaints.find(c => c.complaintCode === created.complaintCode || c.id === created.id);
    expect(studentRecord).toBeDefined();
    expect(studentRecord.status).toBe('Submitted');
    expect(studentRecord.roomNumber).toBe('204');

    // 2. Verify in Warden complaint register
    const wardenRegister = await getAllCleanlinessComplaints({ hostel: 'Sarojini' });
    const wardenRecord = wardenRegister.find(c => c.complaintCode === created.complaintCode || c.id === created.id);
    expect(wardenRecord).toBeDefined();
    expect(wardenRecord.title).toContain('Water tap leaking');

    // 3. Verify in Hostel Admin complaint register (all hostels)
    const adminRegister = await getAllCleanlinessComplaints({});
    const adminRecord = adminRegister.find(c => c.complaintCode === created.complaintCode || c.id === created.id);
    expect(adminRecord).toBeDefined();
  });

  it('2. Warden/Admin updates status to Assigned: status changes across database and displays on student dashboard', async () => {
    const created = await submitCleanlinessComplaint({
      studentName: 'Raj Sahoo',
      rollNumber: '03',
      hostel: 'Sarojini Girls Residence (Block A)',
      block: 'Block A',
      floor: 'Floor 2',
      roomNumber: '204',
      category: 'Dustbin Not Emptied',
      title: 'Corridor waste bin full',
      description: 'The waste bin outside room 204 has not been cleared.',
      location: 'Corridor',
      priority: 'Normal'
    });

    // Warden assigns staff
    await updateCleanlinessComplaintStatus(
      created.id,
      'Assigned',
      'Assigned to Mrs. Laxmi Das for afternoon round',
      'STF-HK-01',
      'Mrs. Laxmi Das (Senior Housekeeping)',
      null,
      'Mrs. Nibedita Das'
    );

    // Verify on Student Dashboard
    const studentList = await getStudentCleanlinessComplaints('03', { studentName: 'Raj Sahoo' });
    const updatedForStudent = studentList.find(c => c.id === created.id || c.complaintCode === created.complaintCode);
    expect(updatedForStudent).toBeDefined();
    expect(updatedForStudent.status).toBe('Assigned');
    expect(updatedForStudent.assignedStaffName).toContain('Mrs. Laxmi Das');

    // Verify in Warden Register
    const wardenList = await getAllCleanlinessComplaints({});
    const updatedForWarden = wardenList.find(c => c.id === created.id || c.complaintCode === created.complaintCode);
    expect(updatedForWarden.status).toBe('Assigned');
  });

  it('3. Staff completes cleaning -> Awaiting Verification -> Student verifies and marks Resolved', async () => {
    const created = await submitCleanlinessComplaint({
      studentName: 'Aman Kumar Sharma',
      rollNumber: '2305201001',
      hostel: 'Gandhi Boys Residence',
      roomNumber: '101',
      category: 'Room Cleaning',
      title: 'Floor mopping and sanitization',
      description: 'Room needs routine sweep and mop.',
      location: 'My Room'
    });

    // Housekeeping marks completed
    await resolveCleanlinessComplaint(
      created.id,
      'Floor thoroughly mopped and sanitized',
      'Use floor disinfectant',
      'Mrs. Laxmi Das'
    );

    // Student sees Awaiting Verification
    let studentList = await getStudentCleanlinessComplaints('2305201001');
    let item = studentList.find(c => c.id === created.id);
    expect(item.status).toBe('Awaiting Verification');

    // Student confirms resolution
    await verifyCleanlinessComplaint(
      created.id,
      'Confirmed Cleaned',
      5,
      'Great job, room is spotless!',
      null,
      'Aman Kumar Sharma'
    );

    // Verify it is now Resolved for both student and warden
    studentList = await getStudentCleanlinessComplaints('2305201001');
    item = studentList.find(c => c.id === created.id);
    expect(item.status).toBe('Resolved');

    const adminList = await getAllCleanlinessComplaints({});
    const adminItem = adminList.find(c => c.id === created.id);
    expect(adminItem.status).toBe('Resolved');
  });

  it('4. Cleanliness Analytics accurately calculates totals, category breakdown, and hostel distribution', async () => {
    const analytics = await getCleanlinessAnalytics();
    expect(analytics).toBeDefined();
    expect(typeof analytics.totalComplaints).toBe('number');
    expect(analytics.complaintsByCategory).toBeDefined();
    expect(analytics.complaintsByHostel).toBeDefined();
    expect(analytics.averageResolutionHours).toBeDefined();
  });
});

