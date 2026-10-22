import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Sparkles, X, ChevronUp, Bot, MessagesSquare } from 'lucide-react';
import { campusConnectStore } from '../../services/campusConnectStore.js';
import './UnifiedFloatingAssistant.css';

export default function UnifiedFloatingAssistant({ account }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => campusConnectStore.getTotalUnreadCount());
  const menuRef = useRef(null);

  useEffect(() => {
    const handleUpdate = () => {
      setUnreadCount(campusConnectStore.getTotalUnreadCount());
    };
    window.addEventListener('campus_connect_updated', handleUpdate);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('campus_connect_updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openAiAssistant = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open_apna_ai_drawer'));
  };

  const openCampusWhatsApp = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open_whatsapp_drawer'));
  };

  return (
    <div className="unified-assistant-container" ref={menuRef}>
      {/* Expanded Quick-Access Tool Menu */}
      {menuOpen && (
        <div className="unified-assistant-menu" role="menu" aria-label="Campus Assistant Services">
          <div className="unified-assistant-menu-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#38bdf8" />
              <span>Campus Digital Services</span>
            </div>
            <button
              className="unified-assistant-menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close assistant menu"
            >
              <X size={14} />
            </button>
          </div>

          <button
            className="unified-assistant-menu-item"
            onClick={openAiAssistant}
            role="menuitem"
          >
            <div className="assistant-item-icon ai-gradient">
              <Bot size={20} color="#ffffff" />
            </div>
            <div className="assistant-item-info">
              <strong>Apna AI Assistant</strong>
              <span>Academic data, timetable, fee & policy Q&A</span>
            </div>
          </button>

          <button
            className="unified-assistant-menu-item"
            onClick={openCampusWhatsApp}
            role="menuitem"
          >
            <div className="assistant-item-icon wa-gradient">
              <MessagesSquare size={20} color="#ffffff" />
            </div>
            <div className="assistant-item-info">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <strong>Campus Connect</strong>
                {unreadCount > 0 && (
                  <span className="assistant-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </div>
              <span>Student & faculty real-time messaging</span>
            </div>
          </button>
        </div>
      )}

      {/* Single Consolidated Floating Trigger Button */}
      <button
        type="button"
        className={`unified-assistant-trigger ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        title="Campus Assistant & Messaging • Click to choose tool"
        aria-label="Toggle Campus Assistant Menu"
        aria-haspopup="true"
        aria-expanded={menuOpen}
      >
        <div className="unified-trigger-inner">
          {menuOpen ? (
            <X size={22} color="#ffffff" />
          ) : (
            <>
              <Sparkles size={20} className="sparkle-float" />
              <MessageSquare size={16} className="message-sub" />
            </>
          )}
        </div>

        {!menuOpen && unreadCount > 0 && (
          <span className="unified-floating-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
    </div>
  );
}
