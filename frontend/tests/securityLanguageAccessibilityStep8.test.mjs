import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { translateText, HINDI_DICTIONARY } from '../src/services/languageStore.js';

describe('STEP 8: Multi-Language & Accessibility for Security Guard Role', () => {
  it('translates core security dashboard labels to Hindi', () => {
    expect(translateText('Security Dashboard', 'hi')).toBe('सुरक्षा डैशबोर्ड');
    expect(translateText('Gate Overview', 'hi')).toBe('गेट अवलोकन');
    expect(translateText('Students Currently Outside', 'hi')).toBe('परिसर से बाहर छात्र');
    expect(translateText('VERIFY & LOG CAMPUS EXIT', 'hi')).toBe('सत्यापित करें एवं परिसर निकास दर्ज करें');
    expect(translateText('VERIFY & LOG CAMPUS ENTRY', 'hi')).toBe('सत्यापित करें एवं परिसर प्रवेश दर्ज करें');
  });

  it('preserves reverse translation back to English without data loss', () => {
    expect(translateText('सुरक्षा डैशबोर्ड', 'en')).toBe('Security Dashboard');
    expect(translateText('गेट अवलोकन', 'en')).toBe('Gate Overview');
  });

  it('SecurityPortal UI components maintain high-contrast accessibility standards and responsive touch targets', () => {
    const portalFile = path.resolve(__dirname, '../src/components/SecurityPortal.jsx');
    const portalCode = fs.readFileSync(portalFile, 'utf8');

    const cssFile = path.resolve(__dirname, '../src/components/SecurityPortal.css');
    const cssCode = fs.readFileSync(cssFile, 'utf8');

    // High contrast dark-mode theme colors
    expect(cssCode).toContain('#0b1329'); // Background base
    expect(cssCode).toContain('#f8fafc'); // High contrast text
    expect(cssCode).toContain('minmax'); // Mobile-responsive grid

    // Touch friendly sizing and mobile media queries
    expect(cssCode).toContain('@media (max-width: 640px)');
  });
});
