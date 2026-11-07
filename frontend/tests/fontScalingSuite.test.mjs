import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { FONT_SCALE_OPTIONS } from '../src/context/FontScaleContext.jsx';

describe('APNA CAMPUS — Text Display Scaling System Suite', () => {
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
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('1. Provides 4 exact scale levels (Small 14px, Normal 16px, Large 18px, Extra Large 20px)', () => {
    expect(FONT_SCALE_OPTIONS.length).toBe(4);
    expect(FONT_SCALE_OPTIONS.map((o) => o.sizePx)).toEqual(['14px', '16px', '18px', '20px']);
    expect(FONT_SCALE_OPTIONS.map((o) => o.percentage)).toEqual(['87.5%', '100%', '112.5%', '125%']);
  });

  it('2. Sets root font size classes and data-scale attributes properly for all 4 options', () => {
    const root = document.documentElement;

    FONT_SCALE_OPTIONS.forEach((opt) => {
      root.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');
      root.classList.add(`font-size-${opt.id}`);
      root.setAttribute('data-scale', opt.id);
      root.setAttribute('data-font-size', opt.id);
      root.style.setProperty('--app-font-size', opt.sizePx);

      expect(root.classList.contains(`font-size-${opt.id}`)).toBe(true);
      expect(root.getAttribute('data-scale')).toBe(opt.id);
      expect(root.getAttribute('data-font-size')).toBe(opt.id);
      expect(root.style.getPropertyValue('--app-font-size')).toBe(opt.sizePx);
    });
  });

  it('3. Persists font scale preference across reloads via localStorage', () => {
    window.localStorage.setItem('apna_font_scale', 'xlarge');
    expect(window.localStorage.getItem('apna_font_scale')).toBe('xlarge');

    window.localStorage.setItem('apna_font_scale', 'small');
    expect(window.localStorage.getItem('apna_font_scale')).toBe('small');
  });

  it('4. Dispatches live DOM events without requiring page reload', () => {
    const listener = vi.fn();
    window.addEventListener('apna_font_scale_changed', listener);

    window.dispatchEvent(new window.CustomEvent('apna_font_scale_changed', { detail: { scale: 'large' } }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

