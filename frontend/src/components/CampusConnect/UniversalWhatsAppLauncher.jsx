import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Maximize2, Minimize2 } from 'lucide-react';
import CampusConnect from './CampusConnect.jsx';
import { campusConnectStore } from '../../services/campusConnectStore.js';
import './UniversalWhatsAppLauncher.css';

export default function UniversalWhatsAppLauncher({ account, hideTrigger = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => campusConnectStore.getTotalUnreadCount());

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(campusConnectStore.getTotalUnreadCount());
    };
    const handleOpenDrawer = () => {
      setIsOpen(true);
    };

    window.addEventListener('campus_connect_updated', handleUpdate);
    window.addEventListener('open_whatsapp_drawer', handleOpenDrawer);

    return () => {
      window.removeEventListener('campus_connect_updated', handleUpdate);
      window.removeEventListener('open_whatsapp_drawer', handleOpenDrawer);
    };
  }, []);

  return (
    <>
      {/* Floating WhatsApp Action Button - Round Circular Shape */}
      {!isOpen && !hideTrigger && (
        <button
          type="button"
          className="universal-wa-trigger-btn"
          onClick={() => setIsOpen(true)}
          title="Campus WhatsApp • Click to view"
          aria-label="Open Apna Campus WhatsApp"
        >
          <div className="wa-icon-glow">
            <MessageSquare size={24} color="#ffffff" />
          </div>
          {unreadCount > 0 && (
            <span className="wa-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      )}

      {/* Slide-out WhatsApp Drawer / Modal */}
      {isOpen && (
        <div className="universal-wa-overlay" onClick={() => setIsOpen(false)}>
          <div
            className={`universal-wa-drawer ${isMaximized ? 'maximized' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header Bar */}
            <div className="universal-wa-header">
              <div className="universal-wa-header-brand">
                <img src="/logo.png" alt="Apna Campus Logo" className="universal-wa-logo" />
                <div>
                  <h4>Campus Connect</h4>
                  <p>College WhatsApp • Live Academic Hub</p>
                </div>
              </div>

              <div className="universal-wa-header-controls">
                <button
                  type="button"
                  className="universal-wa-ctrl-btn"
                  onClick={() => setIsMaximized((prev) => !prev)}
                  title={isMaximized ? 'Restore Drawer' : 'Maximize Window'}
                >
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  className="universal-wa-ctrl-btn close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close WhatsApp Drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded WhatsApp Hub */}
            <div className="universal-wa-body">
              <CampusConnect account={account} isDrawerMode={!isMaximized} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
