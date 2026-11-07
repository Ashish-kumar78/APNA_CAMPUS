import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Type,
  Sun,
  Moon,
  Monitor,
  Eye,
  ZapOff,
  Mic,
  Keyboard,
  RotateCcw,
  Check,
  ShieldCheck,
  Info,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';
import VoiceNavigator, { VOICE_COMMANDS } from './VoiceNavigator.jsx';
import './AccessibilityPanel.css';

export default function AccessibilityPanel() {
  const {
    isPanelOpen,
    closePanel,
    fontSize,
    setFontSize,
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    resetDefaults,
    announce,
  } = useAccessibility();

  const [showVoiceCommands, setShowVoiceCommands] = useState(false);
  const panelRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // Focus management: save previous focus, focus modal on open, trap focus, restore on close
  useEffect(() => {
    if (isPanelOpen) {
      previouslyFocusedElementRef.current = document.activeElement;
      announce('Accessibility Options dialog opened. Press Escape to close.', 'polite');

      // Focus close button or panel without forcing scroll jump
      const focusTimer = setTimeout(() => {
        const closeBtn = panelRef.current?.querySelector('.acc-close-btn');
        if (closeBtn && typeof closeBtn.focus === 'function') {
          closeBtn.focus({ preventScroll: true });
        }
      }, 50);

      // Lock background scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(focusTimer);
        document.body.style.overflow = prevOverflow;
      };
    } else {
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus({ preventScroll: true });
      }
    }
  }, [isPanelOpen, announce]);

  // Trap focus inside modal & close on Escape
  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
        return;
      }

      if (e.key === 'Tab') {
        if (!panelRef.current) return;
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="acc-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
      role="presentation"
    >
      <div
        className="acc-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-panel-title"
        aria-describedby="accessibility-panel-desc"
      >
        {/* Header */}
        <div className="acc-header">
          <div className="acc-title-group">
            <div className="acc-icon-wrap" aria-hidden="true">
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="accessibility-panel-title">Accessibility &amp; Assistive Controls</h2>
              <p id="accessibility-panel-desc">
                WCAG 2.2 AA compliant options for visual comfort, keyboard flow, and voice navigation.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="acc-close-btn"
            onClick={closePanel}
            aria-label="Close Accessibility Controls dialog (Escape)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="acc-body">
          {/* SECTION 1: FONT SIZE ADJUSTMENT */}
          <section className="acc-section" aria-labelledby="acc-font-heading">
            <div className="acc-section-header">
              <Type size={18} aria-hidden="true" />
              <h3 id="acc-font-heading">Text Display Scaling</h3>
            </div>
            <p className="acc-section-hint">
              Scales typography across all modules while preserving table layouts and form usability.
            </p>
            <div className="acc-pill-grid" role="radiogroup" aria-labelledby="acc-font-heading">
              {[
                { id: 'small', label: 'Small', desc: '87.5% (14px)' },
                { id: 'normal', label: 'Normal', desc: '100% (16px)' },
                { id: 'large', label: 'Large', desc: '112.5% (18px)' },
                { id: 'xlarge', label: 'Extra Large', desc: '125% (20px)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={fontSize === opt.id}
                  className={`acc-pill-btn ${fontSize === opt.id ? 'active' : ''}`}
                  onClick={() => {
                    setFontSize(opt.id);
                    announce(`Font size changed to ${opt.label}`, 'polite');
                  }}
                >
                  <span className="pill-title">{opt.label}</span>
                  <span className="pill-sub">{opt.desc}</span>
                  {fontSize === opt.id && <Check size={14} className="pill-check" />}
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 2: THEME SELECTION */}
          <section className="acc-section" aria-labelledby="acc-theme-heading">
            <div className="acc-section-header">
              <Sun size={18} aria-hidden="true" />
              <h3 id="acc-theme-heading">Color Theme</h3>
            </div>
            <p className="acc-section-hint">
              Select between daytime illumination, eye-friendly night theme, or synchronize with OS.
            </p>
            <div className="acc-pill-grid" role="radiogroup" aria-labelledby="acc-theme-heading">
              {[
                { id: 'light', label: 'Light Theme', icon: Sun, desc: 'High luminance daytime' },
                { id: 'dark', label: 'Dark Theme', icon: Moon, desc: 'Reduced glare for low light' },
                { id: 'system', label: 'System Default', icon: Monitor, desc: 'Auto-syncs with your OS' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={`acc-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setTheme(opt.id);
                      announce(`Theme updated to ${opt.label}`, 'polite');
                    }}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="pill-title">{opt.label}</span>
                    <span className="pill-sub">{opt.desc}</span>
                    {isActive && <Check size={14} className="pill-check" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 3: HIGH CONTRAST & REDUCED MOTION TOGGLES */}
          <div className="acc-toggles-grid">
            {/* High Contrast */}
            <div className="acc-toggle-card">
              <div className="acc-toggle-info">
                <div className="acc-toggle-icon">
                  <Eye size={18} />
                </div>
                <div>
                  <h4>High Contrast Mode</h4>
                  <p>Enforces WCAG 2.2 AAA contrast ratio (&ge; 7:1) with solid borders and vivid focus markers.</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={highContrast}
                onClick={() => {
                  const next = !highContrast;
                  setHighContrast(next);
                  announce(next ? 'High Contrast mode enabled' : 'High Contrast mode disabled', 'polite');
                }}
                className={`acc-switch ${highContrast ? 'checked' : ''}`}
                aria-label="Toggle High Contrast Mode"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="acc-toggle-card">
              <div className="acc-toggle-info">
                <div className="acc-toggle-icon">
                  <ZapOff size={18} />
                </div>
                <div>
                  <h4>Reduced Motion</h4>
                  <p>Minimizes non-essential animations and transitions for users with vestibular sensitivities.</p>
                </div>
              </div>
              <div className="acc-segmented-select" role="radiogroup" aria-label="Reduced motion setting">
                {[
                  { id: 'auto', label: 'System' },
                  { id: 'reduce', label: 'Reduced' },
                  { id: 'no-preference', label: 'Standard' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={reducedMotion === m.id}
                    className={`segmented-btn ${reducedMotion === m.id ? 'active' : ''}`}
                    onClick={() => {
                      setReducedMotion(m.id);
                      announce(`Reduced motion set to ${m.label}`, 'polite');
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: VOICE NAVIGATION */}
          <section className="acc-section" aria-labelledby="acc-voice-heading">
            <div className="acc-section-header">
              <Mic size={18} aria-hidden="true" />
              <h3 id="acc-voice-heading">Voice Navigation (Speech Recognition)</h3>
            </div>
            <p className="acc-section-hint">
              Speak naturally to navigate portals, open timetable, attendance, or toggle themes.
            </p>
            <VoiceNavigator />

            {/* Collapsible Supported Commands Guide */}
            <div className="acc-commands-accordion">
              <button
                type="button"
                className="acc-accordion-trigger"
                onClick={() => setShowVoiceCommands((prev) => !prev)}
                aria-expanded={showVoiceCommands}
                aria-controls="acc-voice-commands-list"
              >
                <span>Supported Voice Commands Guide</span>
                {showVoiceCommands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showVoiceCommands && (
                <div id="acc-voice-commands-list" className="acc-commands-table-wrap">
                  <table className="acc-commands-table" aria-label="Voice Commands List">
                    <thead>
                      <tr>
                        <th scope="col">Spoken Phrase</th>
                        <th scope="col">Action Performed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VOICE_COMMANDS.map((cmd, idx) => (
                        <tr key={idx}>
                          <td><code>"{cmd.phrase}"</code></td>
                          <td>{cmd.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 5: KEYBOARD NAVIGATION SHORTCUTS GUIDE */}
          <section className="acc-section" aria-labelledby="acc-keyboard-heading">
            <div className="acc-section-header">
              <Keyboard size={18} aria-hidden="true" />
              <h3 id="acc-keyboard-heading">Keyboard Shortcuts &amp; Focus Flow</h3>
            </div>
            <div className="acc-shortcuts-grid">
              <div className="acc-shortcut-item">
                <kbd>Alt</kbd> + <kbd>A</kbd>
                <span>Toggle Accessibility Controls</span>
              </div>
              <div className="acc-shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>B</kbd>
                <span>Toggle Navigation Sidebar</span>
              </div>
              <div className="acc-shortcut-item">
                <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd>
                <span>Navigate Interactive Controls</span>
              </div>
              <div className="acc-shortcut-item">
                <kbd>Escape</kbd>
                <span>Close Active Dialog or Drawer</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="acc-footer">
          <div className="acc-compliance-tag">
            <ShieldCheck size={16} color="#10b981" />
            <span>Targeting WCAG 2.2 AA Compliance</span>
          </div>
          <div className="acc-footer-actions">
            <button
              type="button"
              className="acc-reset-btn"
              onClick={resetDefaults}
              aria-label="Reset all accessibility settings to default"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              className="acc-done-btn"
              onClick={closePanel}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

