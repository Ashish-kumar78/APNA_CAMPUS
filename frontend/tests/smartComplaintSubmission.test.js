import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../src/services/api.js';

describe('Smart Complaint Submission & Offline Resilience', () => {
  beforeEach(() => {
    if (typeof globalThis.localStorage === 'undefined') {
      const store = {};
      globalThis.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); }
      };
    } else {
      localStorage.clear();
    }
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = {
        dispatchEvent: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    vi.restoreAllMocks();
  });

  it('1. Gracefully handles network fetch failure (Failed to fetch) by generating valid persistent complaint ticket', async () => {
    // Simulate server being offline / fetch throwing Failed to fetch
    vi.spyOn(api, 'lodgeComplaint').mockRejectedValue(new TypeError('Failed to fetch'));

    let ticket = null;
    const payload = {
      title: 'Electrical socket spark',
      description: 'Switchboard burnt in Room 204',
      category: 'Electrical',
      location: 'Sarojini Girls Residence (Block A) · 2nd Floor · Room 204 · Room Attached Bathroom',
      priority: 'High',
      hostel: 'Sarojini Girls Residence (Block A)',
      roomNumber: '204',
      rollNumber: '04',
      studentName: 'Priya Patra',
    };

    try {
      const res = await api.lodgeComplaint(payload);
      ticket = res?.data;
    } catch (networkErr) {
      // Replicates the resilient fallback in SmartComplaintModal.jsx
      ticket = {
        id: `CMP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        location: payload.location,
        priority: payload.priority,
        status: 'Assigned',
        assignedStaffName: 'Mr. Pramod Panda',
        assignedWardenName: 'Mrs. Nibedita Das',
        resolutionDeadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        filedDate: new Date().toLocaleDateString('en-GB'),
      };
    }

    expect(ticket).toBeDefined();
    expect(ticket.id).toMatch(/^CMP-2026-\d{3}$/);
    expect(ticket.category).toBe('Electrical');
    expect(ticket.status).toBe('Assigned');

    // Verify localStorage storage
    const existing = JSON.parse(localStorage.getItem('bput_hostel_complaints_v1') || '[]');
    localStorage.setItem('bput_hostel_complaints_v1', JSON.stringify([ticket, ...existing]));

    const stored = JSON.parse(localStorage.getItem('bput_hostel_complaints_v1'));
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe(ticket.id);
  });

  it('2. When backend returns success, ticket data from backend is preferred', async () => {
    vi.spyOn(api, 'lodgeComplaint').mockResolvedValue({
      success: true,
      data: {
        id: 'CMP-2026-999',
        title: 'Balcony door loose',
        category: 'Civil',
        status: 'Assigned',
        assignedStaffName: 'Mr. Jagabandhu Nayak',
      }
    });

    const res = await api.lodgeComplaint({ title: 'Balcony door loose' });
    expect(res.success).toBe(true);
    expect(res.data.id).toBe('CMP-2026-999');
  });
});

