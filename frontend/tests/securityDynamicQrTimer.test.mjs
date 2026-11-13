import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { dynamicQrService } = await import('../src/services/dynamicQrService.js');

describe('Dynamic QR 10-Second Timer Stability & Rotation', () => {
  const dummyUser = {
    id: 'sec-101',
    identifier: 'SG-OD-4421',
    name: 'Dillip Kumar Pradhan',
    role: 'SECURITY',
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    dynamicQrService.stopLiveSession();
    vi.useRealTimers();
  });

  it('generates an authentic token that lasts for 10 seconds without resetting each second', () => {
    const states = [];
    const cleanup = dynamicQrService.startLiveSession(dummyUser, (state) => {
      states.push({ remaining: state.remainingSecs, token: state.token });
    });

    const initialToken = dynamicQrService.getCurrentState().token;
    expect(initialToken).toBeDefined();
    expect(dynamicQrService.getCurrentState().remainingSecs).toBe(10);

    // Advance by 1 second (1000ms)
    vi.advanceTimersByTime(1000);
    // Even if startLiveSession is re-invoked (simulating parent re-render), it MUST NOT reset!
    dynamicQrService.startLiveSession({ ...dummyUser }, () => {});

    // Token must remain identical and countdown should decrease to 9
    expect(dynamicQrService.getCurrentState().token).toBe(initialToken);
    expect(dynamicQrService.getCurrentState().remainingSecs).toBe(9);

    // Advance 4 more seconds (5 seconds total elapsed)
    vi.advanceTimersByTime(4000);
    dynamicQrService.startLiveSession({ ...dummyUser }, () => {});
    expect(dynamicQrService.getCurrentState().token).toBe(initialToken);
    expect(dynamicQrService.getCurrentState().remainingSecs).toBe(5);

    // Advance to 9.9 seconds - token MUST NOT rotate prematurely
    vi.advanceTimersByTime(4900);
    expect(dynamicQrService.getCurrentState().token).toBe(initialToken);

    // Advance past 10 seconds -> NOW token rotates automatically!
    vi.advanceTimersByTime(200);
    const rotatedToken = dynamicQrService.getCurrentState().token;
    expect(rotatedToken).not.toBe(initialToken);
    expect(dynamicQrService.getCurrentState().remainingSecs).toBe(10);

    cleanup();
  });
});

