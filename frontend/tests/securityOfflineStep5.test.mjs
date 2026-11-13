import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

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
try {
  Object.defineProperty(global.navigator, 'onLine', {
    value: true,
    configurable: true,
    writable: true,
  });
} catch (_) {}

// Dynamic import to use the mock
const { default: securityOfflineStore } = await import('../src/services/securityOfflineStore.js');

describe('STEP 5: Offline Mode & Synchronization Engine for Security Guard', () => {
  beforeEach(() => {
    localStorage.clear();
    securityOfflineStore.clearQueue();
  });

  it('securityOfflineStore exports all required offline lifecycle methods', () => {
    expect(typeof securityOfflineStore.isOnline).toBe('function');
    expect(typeof securityOfflineStore.getQueue).toBe('function');
    expect(typeof securityOfflineStore.getPendingCount).toBe('function');
    expect(typeof securityOfflineStore.enqueueMovement).toBe('function');
    expect(typeof securityOfflineStore.dequeueMovement).toBe('function');
    expect(typeof securityOfflineStore.clearQueue).toBe('function');
    expect(typeof securityOfflineStore.syncQueue).toBe('function');
    expect(typeof securityOfflineStore.subscribe).toBe('function');
    expect(typeof securityOfflineStore.initAutoSync).toBe('function');
  });

  it('enqueueMovement enqueues provisional movements with unique offlineSyncId and "Saved, will sync"', () => {
    const movement = {
      passId: 'GP-2026-TEST',
      rollNumber: '02',
      studentName: 'Priya Patra',
      direction: 'EXIT',
      gateName: 'Gate 1',
      guardId: 'SG-OD-4421',
      guardName: 'Dillip Kumar Pradhan',
    };

    const enqueued = securityOfflineStore.enqueueMovement(movement);

    expect(enqueued.offlineSyncId).toBeDefined();
    expect(enqueued.offlineSyncId.startsWith('SYNC-')).toBe(true);
    expect(enqueued.provisional).toBe(true);
    expect(enqueued.status).toBe('PROVISIONAL_PENDING_SYNC');
    expect(enqueued.displayStatus).toBe('Saved, will sync');

    expect(securityOfflineStore.getPendingCount()).toBe(1);
    const queue = securityOfflineStore.getQueue();
    expect(queue[0].rollNumber).toBe('02');
  });

  it('dequeueMovement removes synced item by offlineSyncId', () => {
    const item1 = securityOfflineStore.enqueueMovement({ passId: 'P1', direction: 'EXIT' });
    const item2 = securityOfflineStore.enqueueMovement({ passId: 'P2', direction: 'ENTRY' });

    expect(securityOfflineStore.getPendingCount()).toBe(2);

    securityOfflineStore.dequeueMovement(item1.offlineSyncId);
    expect(securityOfflineStore.getPendingCount()).toBe(1);

    const remaining = securityOfflineStore.getQueue();
    expect(remaining[0].offlineSyncId).toBe(item2.offlineSyncId);
  });

  it('syncQueue safely transmits offline queue to backend and cleans up synced records', async () => {
    const item = securityOfflineStore.enqueueMovement({
      passId: 'GP-101',
      rollNumber: '02',
      direction: 'EXIT',
    });

    const mockApiClient = {
      syncSecurityOfflineQueue: vi.fn().mockResolvedValue({
        success: true,
        syncedCount: 1,
        failedCount: 0,
        results: [{ syncId: item.offlineSyncId, success: true }],
      }),
    };

    const report = await securityOfflineStore.syncQueue(mockApiClient);

    expect(report.success).toBe(true);
    expect(report.syncedCount).toBe(1);
    expect(report.failedCount).toBe(0);
    expect(mockApiClient.syncSecurityOfflineQueue).toHaveBeenCalledWith({
      movements: [expect.objectContaining({ offlineSyncId: item.offlineSyncId })],
    });
    // Successfully synced item should be removed from queue
    expect(securityOfflineStore.getPendingCount()).toBe(0);
  });

  it('syncQueue halts gracefully if device is completely offline', async () => {
    vi.spyOn(securityOfflineStore, 'isOnline').mockReturnValue(false);
    securityOfflineStore.enqueueMovement({ passId: 'GP-OFFLINE' });

    const mockApiClient = {
      syncSecurityOfflineQueue: vi.fn(),
    };

    const report = await securityOfflineStore.syncQueue(mockApiClient);

    expect(report.success).toBe(false);
    expect(report.reason).toBe('DEVICE_OFFLINE');
    expect(mockApiClient.syncSecurityOfflineQueue).not.toHaveBeenCalled();
    expect(securityOfflineStore.getPendingCount()).toBe(1);

    vi.restoreAllMocks();
  });

  it('SecurityPortal UI contains "Saved, will sync" and provisional scan warnings', () => {
    const portalFile = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
    const portalCode = fs.readFileSync(portalFile, 'utf8');

    expect(portalCode).toContain('Saved, will sync');
    expect(portalCode).toContain('PROVISIONAL SCAN');
    expect(portalCode).toContain('sec-offline-banner');
    expect(portalCode).toContain('securityOfflineStore');
    expect(portalCode).toContain('Sync Queue Now');
  });
});
