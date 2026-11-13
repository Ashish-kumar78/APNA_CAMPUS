import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { labStaffStore } from '../src/services/labStaffStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('STEP 12: Real-Time Notifications & Broadcast Feeds', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const frontendDir = path.resolve(rootDir, 'frontend/src');

  // 1. broadcastNotification creation
  it('1. labStaffStore.broadcastNotification creates broadcast alert across roles and branches', () => {
    const broadcast = labStaffStore.broadcastNotification({
      title: 'Scheduled Electrical Substation Maintenance',
      message: 'Substation Transformer-B will be under routine maintenance on Saturday 06:00 AM to 12:00 PM. High voltage test benches in EEE and ECE will be powered down.',
      category: 'Maintenance & Repairs',
      priority: 'High',
      targetRole: 'STAFF',
      branch: 'EEE',
      sender: 'Campus Electrical Engineering Cell'
    });

    expect(broadcast).toBeDefined();
    expect(broadcast.id).toMatch(/^NOTIF-BC-/);
    expect(broadcast.isBroadcast).toBe(true);
    expect(broadcast.unread).toBe(true);
    expect(broadcast.branch).toBe('EEE');
    expect(broadcast.targetRole).toBe('STAFF');
    expect(broadcast.priority).toBe('High');

    const notifs = labStaffStore.getNotifications();
    expect(notifs[0].id).toBe(broadcast.id);
  });

  // 2. Critical Broadcast Audit Logging
  it('2. Emitting a Critical priority broadcast automatically logs in the institutional audit trail', () => {
    const criticalAlert = labStaffStore.broadcastNotification({
      title: 'Chemical Fume Hood Evacuation Alert',
      message: 'Acid vapor exhaust duct pressure drop detected in Bio Hub Block-G. Immediate evacuation of BIOTECH-LAB-01 ordered.',
      category: 'Safety & Hazard',
      priority: 'Critical',
      targetRole: 'ALL',
      branch: 'BIOTECH',
      sender: 'Chief Safety Officer Er. S. K. Dash'
    });

    expect(criticalAlert.priority).toBe('Critical');

    // Audit log verification
    const auditLogs = labStaffStore.getAuditLogs();
    const alertAudit = auditLogs.find(a => 
      a.action === 'Critical Laboratory Broadcast Emitted' && 
      (a.target.includes('Chemical Fume Hood') || a.target.includes('BIOTECH'))
    );
    expect(alertAudit).toBeDefined();
    expect(alertAudit.status).toBe('Broadcasted');
    expect(alertAudit.user).toBe('Chief Safety Officer Er. S. K. Dash');
  });

  // 3. Multi-Criteria Notification Filtering
  it('3. labStaffStore.getNotifications supports filtering by branch, role, priority, and unread status', () => {
    const biotechNotifs = labStaffStore.getNotifications({ branch: 'BIOTECH' });
    expect(biotechNotifs.length).toBeGreaterThan(0);
    biotechNotifs.forEach(n => {
      expect(!n.branch || n.branch === 'ALL' || n.branch === 'BIOTECH').toBe(true);
    });

    const criticalNotifs = labStaffStore.getNotifications({ priority: 'Critical' });
    expect(criticalNotifs.length).toBeGreaterThan(0);
    criticalNotifs.forEach(n => expect(n.priority).toBe('Critical'));

    const unreadNotifs = labStaffStore.getNotifications({ unreadOnly: true });
    expect(unreadNotifs.length).toBeGreaterThan(0);
    unreadNotifs.forEach(n => expect(n.unread).toBe(true));
  });

  // 4. Mark Read and Mark All Read
  it('4. labStaffStore.markNotificationRead and markAllNotificationsRead update unread status', () => {
    const initialUnread = labStaffStore.getUnreadNotificationsCount();
    expect(initialUnread).toBeGreaterThan(0);

    const firstUnread = labStaffStore.data.notifications.find(n => n.unread);
    expect(firstUnread).toBeDefined();

    labStaffStore.markNotificationRead(firstUnread.id);
    const updatedTarget = labStaffStore.data.notifications.find(n => n.id === firstUnread.id);
    expect(updatedTarget.unread).toBe(false);

    // Mark all read
    labStaffStore.markAllNotificationsRead();
    expect(labStaffStore.getUnreadNotificationsCount()).toBe(0);
  });

  // 5. AdminLaboratoryManagementModule UI incorporates Broadcast triggers & Alert Banner
  it('5. AdminLaboratoryManagementModule exposes Dispatch Broadcast, Emergency Alert Banner, and Broadcast Modal', () => {
    const modPath = path.join(frontendDir, 'components/laboratory/AdminLaboratoryManagementModule.jsx');
    const modContent = fs.readFileSync(modPath, 'utf8');

    expect(modContent).toMatch(/Dispatch Broadcast/);
    expect(modContent).toMatch(/REAL-TIME CRITICAL BROADCAST ALERT BANNER/);
    expect(modContent).toContain('activeBroadcastAlerts');
    expect(modContent).toContain('Acknowledge');
    expect(modContent).toMatch(/Dispatch Laboratory Broadcast Alert/);
    expect(modContent).toContain('Transmit Broadcast');
    expect(modContent).toMatch(/Target Engineering Discipline/);
  });

  // 6. ProfileSettingsTab in Staff Portal contains Laboratory Alerts & Notification Center
  it('6. ProfileSettingsTab exposes interactive Laboratory Alerts & Notification Center with filtering', () => {
    const tabPath = path.join(frontendDir, 'components/StaffModules/ProfileSettingsTab.jsx');
    const tabContent = fs.readFileSync(tabPath, 'utf8');

    expect(modPathExists(tabPath)).toBe(true);
    expect(tabContent).toMatch(/Laboratory Alerts\s*(&|&amp;)\s*Notification Center/);
    expect(tabContent).toContain('markAllNotificationsRead');
    expect(tabContent).toContain('handleMarkRead');
    expect(tabContent).toContain('filteredNotifs');
  });
});

function modPathExists(p) {
  return fs.existsSync(p);
}

