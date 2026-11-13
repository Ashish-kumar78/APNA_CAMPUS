import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 11: Academic Laboratory & Practical Attendance Integration', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. Timetable sessions filtered by branch
  it('1. labStaffStore.getTimetable returns branch-specific practical sessions with zero contamination', () => {
    const cseSessions = labStaffStore.getTimetable('CSE');
    expect(cseSessions.length).toBeGreaterThan(0);
    cseSessions.forEach(s => expect(s.department).toBe('CSE'));

    const biotechSessions = labStaffStore.getTimetable('BIOTECH');
    expect(biotechSessions.length).toBeGreaterThan(0);
    biotechSessions.forEach(s => expect(s.department).toBe('BIOTECH'));

    const mechSessions = labStaffStore.getTimetable('MECH');
    expect(mechSessions.length).toBeGreaterThan(0);
    mechSessions.forEach(s => expect(s.department).toBe('MECH'));
  });

  // 2. Lab Readiness Checklist Verification
  it('2. labStaffStore.markSessionReadiness records pre-session instrument & safety checks', () => {
    labStaffStore.setBranch('CSE');
    const sessions = labStaffStore.getTimetable('CSE');
    expect(sessions.length).toBeGreaterThan(0);
    const targetSession = sessions[0];

    labStaffStore.markSessionReadiness(targetSession.id, true, 'Patch panels tested, Cisco packet tracer licenses verified, fire extinguisher inspected.');

    const updated = labStaffStore.getTimetable('CSE').find(s => s.id === targetSession.id);
    expect(updated.readinessCompleted).toBe(true);
    expect(updated.readinessNotes).toContain('Cisco packet tracer');
  });

  // 3. Save Student Attendance Workflow
  it('3. labStaffStore.saveAttendance updates present/absent counts, sets status to Completed, and pushes notification', () => {
    labStaffStore.setBranch('CSE');
    const sessions = labStaffStore.getTimetable('CSE');
    expect(sessions.length).toBeGreaterThan(0);
    const targetSession = sessions[0];

    const studentRoster = [
      { roll: 'CSE-24-001', regNo: '240102001', name: 'Aayush Mohapatra', attendanceStatus: 'Present' },
      { roll: 'CSE-24-002', regNo: '240102002', name: 'Abhilash Tripathy', attendanceStatus: 'Present' },
      { roll: 'CSE-24-003', regNo: '240102003', name: 'Aditi Priyadarshini', attendanceStatus: 'Present' },
      { roll: 'CSE-24-004', regNo: '240102004', name: 'Alok Kumar Jena', attendanceStatus: 'Absent' },
      { roll: 'CSE-24-005', regNo: '240102005', name: 'Ananya Panda', attendanceStatus: 'Late' }
    ];

    const updatedSession = labStaffStore.saveAttendance(targetSession.id, studentRoster, 'Batch A1 conducted smoothly. Alok Jena on medical leave.');

    expect(updatedSession).toBeDefined();
    expect(updatedSession.attendanceTaken).toBe(true);
    expect(updatedSession.status).toBe('Completed');
    expect(updatedSession.presentCount).toBe(3);
    expect(updatedSession.absentCount).toBe(1);
    expect(updatedSession.lateCount).toBe(1);
    expect(updatedSession.sessionNotes).toContain('medical leave');

    // Verify central notification was created
    const notifs = labStaffStore.data.notifications;
    const attNotif = notifs.find(n => n.title === 'Practical Attendance Recorded');
    expect(attNotif).toBeDefined();
    expect(attNotif.message).toContain('3 Present');
  });

  // 4. Practical Evaluation Rubrics & Continuous Grading
  it('4. labStaffStore.saveEvaluation computes 4-point rubric total and assigns academic letter grade', () => {
    const evaluation = labStaffStore.saveEvaluation({
      roll: 'CSE-24-003',
      name: 'Aditi Priyadarshini',
      department: 'CSE',
      subject: 'Computer Networks Practical',
      experiment: 'VLAN Configuration & Router on a Stick',
      experimentation: 10,
      viva: 9,
      recordWork: 10,
      timeliness: 9,
      remarks: 'Flawless router encapsulation setup; answered IEEE 802.1Q frame format queries accurately.'
    });

    expect(evaluation).toBeDefined();
    expect(evaluation.id).toMatch(/^EVAL-/);
    expect(evaluation.totalScore).toBe(38); // 10 + 9 + 10 + 9 = 38
    expect(evaluation.grade).toBe('O'); // Outstanding for score >= 36

    const savedList = labStaffStore.getEvaluations('CSE');
    expect(savedList.length).toBeGreaterThan(0);
    const found = savedList.find(e => e.roll === 'CSE-24-003');
    expect(found).toBeDefined();
    expect(found.totalScore).toBe(38);
  });

  // 5. AdminLaboratoryManagementModule Tab D Integration
  it('5. AdminLaboratoryManagementModule Tab D renders practical sessions, View Roster action, and Syllabi Register', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/Today's Practical Sessions\s*(&|&amp;)\s*Attendance Tracking/);
    expect(modContent).toContain('View Roster');
    expect(modContent).toMatch(/Approved Practical Experiment Syllabi\s*(&|&amp;)\s*Continuous Evaluation/);
    expect(modContent).toMatch(/Practical Session Attendance Roster\s*(&|&amp;)\s*Readiness/);
    expect(modContent).toContain('LAB READINESS');
    expect(modContent).toContain('Continuous Grade');
  });

  // 6. AcademicsAttendanceTab component in Staff Portal
  it('6. AcademicsAttendanceTab exposes attendance finalization and continuous evaluation sync', () => {
    const tabPath = path.join(frontendDir, 'components/StaffModules/AcademicsAttendanceTab.jsx');
    const tabContent = fs.readFileSync(tabPath, 'utf8');

    expect(tabContent).toContain('handleSaveAttendance');
    expect(tabContent).toContain('handleFinalizeAttendance');
    expect(tabContent).toMatch(/Continuous Practical Evaluation\s*(&|&amp;)\s*Rubrics/);
    expect(tabContent).toContain('labStaffStore.saveEvaluation');
    expect(tabContent).toContain('Semester Practical Completion Ledger');
  });
});

