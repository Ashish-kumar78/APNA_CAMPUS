import React from 'react';
import PublicTimetable from '../components/PublicTimetable.jsx';

/**
 * TimetablePage directly renders the institutional Apna Campus Timetables
 * matching the official class routine system.
 */
export default function TimetablePage({ onClose }) {
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
    }
  };

  return <PublicTimetable onClose={handleClose} />;
}
