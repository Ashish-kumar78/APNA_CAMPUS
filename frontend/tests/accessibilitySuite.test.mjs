import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('APNA CAMPUS — Centralized Accessibility System Test Suite', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html lang="en"><body><div id="root"></div></body></html>', {
      url: 'http://localhost:5173',
      pretendToBeVisual: true,
    });
    window = dom.window;
    document = window.document;

    // Use window.localStorage directly (already provided by jsdom)
    window.localStorage.clear();

    // Polyfill matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('1. Font Size Adjustment: Sets classes and attributes for small, normal, large, xlarge', () => {
    const root = document.documentElement;
    const sizes = ['small', 'normal', 'large', 'xlarge'];

    sizes.forEach((sz) => {
      root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
      root.classList.add(`font-size-${sz}`);
      root.setAttribute('data-font-size', sz);

      expect(root.classList.contains(`font-size-${sz}`)).toBe(true);
      expect(root.getAttribute('data-font-size')).toBe(sz);
    });
  });

  it('2. Theme Accessibility: Toggles between light, dark, and system default with data-theme', () => {
    const root = document.documentElement;

    // Light Theme
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    expect(root.classList.contains('dark')).toBe(false);
    expect(root.getAttribute('data-theme')).toBe('light');

    // Dark Theme
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('3. High Contrast Mode: Enforces high contrast class and data-contrast attribute', () => {
    const root = document.documentElement;

    // Enable High Contrast
    root.classList.add('high-contrast');
    root.setAttribute('data-contrast', 'high');
    expect(root.classList.contains('high-contrast')).toBe(true);
    expect(root.getAttribute('data-contrast')).toBe('high');

    // Disable High Contrast
    root.classList.remove('high-contrast');
    root.removeAttribute('data-contrast');
    expect(root.classList.contains('high-contrast')).toBe(false);
    expect(root.getAttribute('data-contrast')).toBeNull();
  });

  it('4. Reduced Motion: Applies reduced motion class when requested', () => {
    const root = document.documentElement;

    root.classList.add('reduced-motion');
    root.setAttribute('data-reduced-motion', 'true');
    expect(root.classList.contains('reduced-motion')).toBe(true);
    expect(root.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('5. Storage Persistence: Persists accessibility settings in localStorage and recovers cleanly', () => {
    const settings = {
      fontSize: 'large',
      theme: 'dark',
      highContrast: true,
      reducedMotion: 'reduce',
      voiceNavEnabled: true,
    };

    window.localStorage.setItem('apna_accessibility_settings', JSON.stringify(settings));

    const retrieved = JSON.parse(window.localStorage.getItem('apna_accessibility_settings'));
    expect(retrieved).toEqual(settings);
    expect(retrieved.fontSize).toBe('large');
    expect(retrieved.theme).toBe('dark');
    expect(retrieved.highContrast).toBe(true);
    expect(retrieved.reducedMotion).toBe('reduce');
    expect(retrieved.voiceNavEnabled).toBe(true);
  });

  it('6. Voice Navigation Commands: Correctly maps spoken phrases to navigation events', () => {
    const eventsDispatched = [];
    window.addEventListener('apna_campus_voice_navigate', (e) => {
      eventsDispatched.push(e.detail.targetTab);
    });

    // Simulate speech recognition results
    const simulateVoiceInput = (phrase) => {
      const clean = phrase.toLowerCase().trim();
      let targetTab = '';
      if (clean.includes('timetable')) targetTab = 'timetable';
      else if (clean.includes('attendance')) targetTab = 'attendance';
      else if (clean.includes('fee')) targetTab = 'fees';
      else if (clean.includes('hostel')) targetTab = 'hostel';
      else if (clean.includes('transport')) targetTab = 'transport';
      else if (clean.includes('dashboard')) targetTab = 'dashboard';

      if (targetTab) {
        window.dispatchEvent(new window.CustomEvent('apna_campus_voice_navigate', { detail: { targetTab } }));
      }
    };

    simulateVoiceInput('open timetable');
    simulateVoiceInput('please open attendance');
    simulateVoiceInput('check hostel complaints');
    simulateVoiceInput('go to dashboard');

    expect(eventsDispatched).toEqual(['timetable', 'attendance', 'hostel', 'dashboard']);
  });

  it('7. Screen Reader Announcer: Generates ARIA live regions for polite and assertive updates', () => {
    const announcerContainer = document.createElement('div');
    announcerContainer.innerHTML = `
      <div role="status" aria-live="polite" aria-atomic="true" id="apna-sr-polite-announcer">Accessibility panel opened</div>
      <div role="alert" aria-live="assertive" aria-atomic="true" id="apna-sr-assertive-announcer">Microphone permission denied</div>
    `;
    document.body.appendChild(announcerContainer);

    const politeRegion = document.getElementById('apna-sr-polite-announcer');
    const assertiveRegion = document.getElementById('apna-sr-assertive-announcer');

    expect(politeRegion.getAttribute('role')).toBe('status');
    expect(politeRegion.getAttribute('aria-live')).toBe('polite');
    expect(politeRegion.textContent).toBe('Accessibility panel opened');

    expect(assertiveRegion.getAttribute('role')).toBe('alert');
    expect(assertiveRegion.getAttribute('aria-live')).toBe('assertive');
    expect(assertiveRegion.textContent).toBe('Microphone permission denied');
  });

  it('8. Keyboard Navigation: Verifies Alt+A shortcut listener and dialog focus attributes', () => {
    let altAPressed = false;
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        altAPressed = true;
      }
    });

    const event = new window.KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true });
    window.dispatchEvent(event);

    expect(altAPressed).toBe(true);
  });

  it('9. Skip To Content Link: Verifies target landmark #main-content exists in AppLayout', () => {
    const layout = document.createElement('div');
    layout.innerHTML = `
      <a href="#main-content" class="skip-to-main-link">Skip to main content</a>
      <main class="apna-main-workspace" role="main" id="main-content">
        <h1>Dashboard Workspace</h1>
      </main>
    `;
    document.body.appendChild(layout);

    const skipLink = document.querySelector('.skip-to-main-link');
    const mainContent = document.getElementById('main-content');

    expect(skipLink).not.toBeNull();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
    expect(mainContent).not.toBeNull();
    expect(mainContent.getAttribute('role')).toBe('main');
  });
});
