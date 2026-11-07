import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import SomeshChatInterface from './SomeshChatInterface.jsx';
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
      {/* Floating Action Button - Modern Round Chat Trigger */}
      {!isOpen && !hideTrigger && (
        <button
          type="button"
          className="universal-wa-trigger-btn"
          onClick={() => setIsOpen(true)}
          title="Campus Chat Hub • Click to chat"
          aria-label="Open Apna Campus Chat"
        >
          <div className="wa-icon-glow">
            <MessageCircle size={24} color="#ffffff" />
          </div>
          {unreadCount > 0 && (
            <span className="wa-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      )}

      {/* Slide-out / Modal Chat Interface */}
      {isOpen && (
        <div className="universal-wa-overlay" onClick={() => setIsOpen(false)}>
          <div
            className={`universal-wa-drawer ${isMaximized ? 'maximized' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {/* Embedded Somesh Chat Interface */}
            <div className="universal-wa-body" style={{ height: '100%', width: '100%' }}>
              <SomeshChatInterface
                account={account}
                isDrawerMode={!isMaximized}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
