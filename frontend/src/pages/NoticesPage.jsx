import React from 'react';
import NotificationCenter from '../components/Notifications/NotificationCenter.jsx';
import './NoticesPage.css';

export default function NoticesPage({ account, onNavigateHome }) {
  const currentUser = account || {
    name: 'Anshuman Nanda',
    role: 'student',
    department: 'Computer Science & Engineering',
    program: 'B.Tech CSE (5th Sem)',
  };

  return (
    <div className="notices-page-container">
      <NotificationCenter
        currentUser={currentUser}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
}
