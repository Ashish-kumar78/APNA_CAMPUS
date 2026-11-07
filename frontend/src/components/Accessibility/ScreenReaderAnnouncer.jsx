import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';

/**
 * ScreenReaderAnnouncer
 * Renders ARIA live regions for screen readers (NVDA, JAWS, VoiceOver, Narrator).
 * Uses WCAG compliant 'polite' and 'assertive' priority queues.
 */
export default function ScreenReaderAnnouncer() {
  const { announcement } = useAccessibility();

  const isAssertive = announcement?.priority === 'assertive';
  const isPolite = !isAssertive && Boolean(announcement?.message);

  return (
    <div
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        id="apna-sr-polite-announcer"
      >
        {isPolite ? announcement.message : ''}
      </div>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        id="apna-sr-assertive-announcer"
      >
        {isAssertive ? announcement.message : ''}
      </div>
    </div>
  );
}

