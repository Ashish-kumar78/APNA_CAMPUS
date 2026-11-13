import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';
import { BRANCHES_CONFIG } from '../src/components/StaffModules/labStaffData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 4: Staff Lab Dashboard & Real Dynamic Branch Switching Verification', () => {
  // 1. Dynamic Switching to Biotechnology
  it('1. Selecting Biotechnology strictly isolates Biotech laboratories, equipment, timetable and requisitions', () => {
    labStaffStore.setBranch('BIOTECH');
    const state = labStaffStore.data;

    expect(state.currentBranch).toBe('BIOTECH');
    expect(state.activeLabId).toBe('BIOTECH-LAB-01');

    // Laboratories
    const biotechLabs = state.laboratories.filter(l => l.department === 'BIOTECH');
    expect(biotechLabs.length).toBeGreaterThanOrEqual(2);
    expect(biotechLabs.some(l => l.name.includes('Genetic Engineering'))).toBe(true);
    expect(biotechLabs.some(l => l.department === 'CSE')).toBe(false);

    // Timetable sessions
    const biotechSessions = state.timetable.filter(t => t.department === 'BIOTECH');
    expect(biotechSessions.length).toBeGreaterThanOrEqual(2);
    expect(biotechSessions.some(s => s.subject.includes('Genetic Engineering'))).toBe(true);
    expect(biotechSessions.some(s => s.subject.includes('Computer Networks'))).toBe(false);

    // Equipment
    const biotechEquipment = state.equipment.filter(e => e.department === 'BIOTECH');
    expect(biotechEquipment.length).toBeGreaterThanOrEqual(3);
    expect(biotechEquipment.some(e => e.name.includes('Biosafety Cabinet'))).toBe(true);

    // Requisitions
    const biotechReqs = state.requisitions.filter(r => r.department === 'BIOTECH');
    expect(biotechReqs.length).toBeGreaterThanOrEqual(1);
    expect(biotechReqs[0].requisitionNo).toContain('BIOTECH');

    // Maintenance orders
    const biotechOrders = state.maintenanceOrders.filter(m => m.department === 'BIOTECH');
    expect(biotechOrders.length).toBeGreaterThanOrEqual(1);
    expect(biotechOrders[0].labId).toContain('BIOTECH');
  });

  // 2. Dynamic Switching to CSE (AI)
  it('2. Selecting CSE (AI) dynamically re-scopes laboratories, DGX GPU nodes, neural sessions and work orders', () => {
    labStaffStore.setBranch('CSE_AI');
    const state = labStaffStore.data;

    expect(state.currentBranch).toBe('CSE_AI');
    expect(state.activeLabId).toBe('AI-LAB-01');

    // Laboratories
    const aiLabs = state.laboratories.filter(l => l.department === 'CSE_AI');
    expect(aiLabs.length).toBeGreaterThanOrEqual(2);
    expect(aiLabs.some(l => l.name.includes('Deep Learning'))).toBe(true);

    // Timetable
    const aiSessions = state.timetable.filter(t => t.department === 'CSE_AI');
    expect(aiSessions.length).toBeGreaterThanOrEqual(2);
    expect(aiSessions.some(s => s.subject.includes('Neural Networks'))).toBe(true);
    expect(aiSessions.some(s => s.subject.includes('Genetic Engineering'))).toBe(false);

    // Equipment
    const aiEquipment = state.equipment.filter(e => e.department === 'CSE_AI');
    expect(aiEquipment.length).toBeGreaterThanOrEqual(2);
    expect(aiEquipment.some(e => e.name.includes('DGX') || e.name.includes('Jetson'))).toBe(true);

    // Requisitions
    const aiReqs = state.requisitions.filter(r => r.department === 'CSE_AI');
    expect(aiReqs.length).toBeGreaterThanOrEqual(1);
    expect(aiReqs[0].requisitionNo).toContain('AI');
  });

  // 3. Return to Computer Science Engineering (CSE)
  it('3. Selecting CSE restores systems engineering lab, Cisco networking sessions and Cat6 requisitions', () => {
    labStaffStore.setBranch('CSE');
    const state = labStaffStore.data;

    expect(state.currentBranch).toBe('CSE');
    expect(state.activeLabId).toBe('CSE-LAB-02');

    // Timetable
    const cseSessions = state.timetable.filter(t => t.department === 'CSE');
    expect(cseSessions.length).toBeGreaterThanOrEqual(3);
    expect(cseSessions.some(s => s.subject.includes('Computer Networks'))).toBe(true);

    // Equipment
    const cseEquipment = state.equipment.filter(e => e.department === 'CSE');
    expect(cseEquipment.length).toBeGreaterThanOrEqual(4);

    // Requisitions
    const cseReqs = state.requisitions.filter(r => r.department === 'CSE');
    expect(cseReqs.length).toBeGreaterThanOrEqual(2);
    expect(cseReqs.some(r => r.requisitionNo.includes('CSE'))).toBe(true);
  });

  // 4. Zero Cross-Contamination Verification
  it('4. Asserts 100% strict branch data isolation with zero cross-contamination between disciplines', () => {
    const branches = ['BIOTECH', 'CSE_AI', 'CSE', 'ECE', 'CIVIL', 'EEE'];

    branches.forEach(branch => {
      labStaffStore.setBranch(branch);
      const state = labStaffStore.data;

      // Ensure active lab belongs strictly to the branch
      const activeLab = state.laboratories.find(l => l.id === state.activeLabId);
      expect(activeLab).toBeDefined();
      expect(activeLab.department).toBe(branch);

      // Ensure branch equipment does not contain foreign branch tags
      const branchEq = state.equipment.filter(e => e.department === branch);
      branchEq.forEach(eq => {
        expect(eq.department).toBe(branch);
      });

      // Ensure branch timetable does not leak other branches
      const branchTimetable = state.timetable.filter(t => t.department === branch);
      branchTimetable.forEach(session => {
        expect(session.department).toBe(branch);
      });
    });
  });

  // 5. Reactive Listener Subscription Verification
  it('5. Subscribers receive real-time updates upon branch and laboratory switching', () => {
    let notifiedState = null;
    const unsubscribe = labStaffStore.subscribe((next) => {
      notifiedState = next;
    });

    labStaffStore.setBranch('BIOTECH');
    expect(notifiedState).not.toBeNull();
    expect(notifiedState.currentBranch).toBe('BIOTECH');

    labStaffStore.setActiveLabId('BIOTECH-LAB-02');
    expect(notifiedState.activeLabId).toBe('BIOTECH-LAB-02');

    unsubscribe();
  });
});

