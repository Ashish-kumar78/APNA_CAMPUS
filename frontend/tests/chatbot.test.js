import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/services/api.js';

describe('Apna AI Assistant - Frontend Chatbot Integration Tests', () => {
  beforeEach(() => {
    if (typeof global.localStorage === 'undefined') {
      const store = {};
      global.localStorage = {
        getItem: (k) => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      };
    }
  });

  it('should formulate correct askChatbot request payload with message, history, context, and user', async () => {
    const mockResponse = {
      success: true,
      reply: 'Your attendance is 92%.',
      source: 'campus-live-data',
      suggestions: ['Check my CGPA', 'When are internal exams?'],
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    try {
      const res = await api.askChatbot(
        'What is my attendance percentage?',
        [{ role: 'user', content: 'Hello' }],
        { page: 'attendance', tab: 'attendance' },
        { role: 'student', identifier: '2305201001' }
      );

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = global.fetch.mock.calls[0];
      expect(callArgs[0]).toContain('/chatbot/query');

      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.message).toBe('What is my attendance percentage?');
      expect(requestBody.history.length).toBe(1);
      expect(requestBody.context.page).toBe('attendance');
      expect(requestBody.user.role).toBe('student');
      expect(res.success).toBe(true);
      expect(res.reply).toBe('Your attendance is 92%.');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should handle role-specific questions and provide valid suggestions', () => {
    const studentQueries = [
      'What is my attendance percentage?',
      'Check my CGPA and SGPA',
      'How to download ID card?',
    ];
    const hodQueries = [
      'Which marks submissions are pending approval?',
      'How many students are in my department?',
      'Which students have attendance below 75%?',
    ];

    expect(studentQueries.length).toBeGreaterThan(0);
    expect(hodQueries.length).toBeGreaterThan(0);
    expect(hodQueries[0]).toContain('pending approval');
  });

  it('should reject or handle offline network failure gracefully without throwing unhandled exceptions', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error / Server offline'));

    try {
      await expect(
        api.askChatbot('Test offline prompt')
      ).rejects.toThrow('Network error / Server offline');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
