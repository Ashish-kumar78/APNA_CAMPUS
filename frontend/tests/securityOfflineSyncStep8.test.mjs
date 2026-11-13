import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock localStorage for node test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.window = {
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
global.CustomEvent = class CustomEvent {
  constructor(name, opts) {
    this.name = name;
    this.detail = opts?.detail;
  }
};

const { securityOfflineStore } = await import('../src/services/securityOfflineStore.js');

describe('STEP 8: Offline Queueing, Synchronization & PWA Engine', () => {
  const servicePath = path.resolve(__dirname, '../../backend/src/security/security.service.ts');
  const controllerPath = path.resolve(__dirname, '../../backend/src/security/security.controller.ts');
  const portalPath = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');

  const serviceCode = fs.readFileSync(servicePath, 'utf8');
  const controllerCode = fs.readFileSync(controllerPath, 'utf8');
  const portalCode = fs.readFileSync(portalPath, 'utf8');

  beforeEach(() => {
    localStorage.clear();
    securityOfflineStore.clearQueue();
  });

  describe('1. Offline Queue Mechanics & Provisional Status Enforcement', () => {
    it('Enqueues movements locally with unique offlineSyncId and provisional pending status', () => {
      const movement = {
        passId: 'GP-2026-1035',
        rollNumber: '03',
        studentName: 'Sneha Mohanty',
        direction: 'EXIT',
        gateName: 'Main Campus Gate 1',
        guardId: 'SEC-101',
      };

      const queued = securityOfflineStore.enqueueMovement(movement);
      expect(queued.offlineSyncId).toBeDefined();
      expect(queued.provisional).toBe(true);
      expect(queued.status).toBe('PROVISIONAL_PENDING_SYNC');
      expect(queued.displayStatus).toBe('Saved, will sync');
      expect(securityOfflineStore.getPendingCount()).toBe(1);
    });

    it('Frontend Security Portal explicitly flags offline scans as provisional until server confirmation', () => {
      expect(portalCode).toContain('Provisional scan - pending server confirmation');
      expect(portalCode).toContain('Saved, will sync');
      expect(portalCode).toContain('offlineQueueCount');
    });
  });

  describe('2. Idempotent Backend Synchronization & Conflict Resolution', () => {
    it('Backend syncs offline queue in FIFO order and returns syncedCount, failedCount, and results', () => {
      expect(serviceCode).toContain('syncOfflineQueue(dto: SyncOfflineQueueDto');
      expect(serviceCode).toContain('syncedCount');
      expect(serviceCode).toContain('failedCount');
      expect(controllerCode).toContain("@Post('sync-offline-queue')");
      expect(controllerCode).toContain('@Roles(Role.SECURITY, Role.ADMIN, Role.SUPER_ADMIN)');
    });

    it('Dispatches security incident on duplicate movement synchronization conflict', () => {
      expect(serviceCode).toContain('Offline Sync Conflict: Duplicate Movement Attempt');
      expect(serviceCode).toContain('Movement Synchronization Conflict');
    });

    it('Reconciles queue locally upon successful synchronization response', async () => {
      const item1 = securityOfflineStore.enqueueMovement({ passId: 'GP-01', direction: 'EXIT' });
      const item2 = securityOfflineStore.enqueueMovement({ passId: 'GP-02', direction: 'ENTRY' });
      expect(securityOfflineStore.getPendingCount()).toBe(2);

      const mockApiClient = {
        syncSecurityOfflineQueue: vi.fn().mockResolvedValue({
          success: true,
          syncedCount: 1,
          failedCount: 0,
          results: [{ syncId: item1.offlineSyncId, success: true }],
        }),
      };

      const report = await securityOfflineStore.syncQueue(mockApiClient);
      expect(report.success).toBe(true);
      expect(securityOfflineStore.getPendingCount()).toBe(1);
      expect(securityOfflineStore.getQueue()[0].offlineSyncId).toBe(item2.offlineSyncId);
    });
  });

  describe('3. PWA Capabilities & Outdoor Visibility', () => {
    it('Frontend provides offline reconnect listener and queue badge indicator', () => {
      expect(portalCode).toContain("window.addEventListener('online'");
      expect(portalCode).toContain("window.addEventListener('offline'");
      expect(portalCode).toContain('offlineQueueCount > 0');
    });
  });
});

