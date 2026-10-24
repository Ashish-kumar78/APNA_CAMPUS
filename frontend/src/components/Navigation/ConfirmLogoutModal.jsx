import React, { useEffect, useRef } from 'react';
import { LogOut, AlertCircle, X } from 'lucide-react';

/**
 * ConfirmLogoutModal
 * Production-quality confirmation dialog before ending user session.
 * Accessible: focus trap / autoFocus, ESC to cancel, backdrop click to cancel, ARIA attributes.
 */
export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false
}) {
  const cancelBtnRef = useRef(null);
  const modalRef = useRef(null);

  // Focus the Cancel button on open (safe default preventing accidental logouts)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (cancelBtnRef.current) {
          cancelBtnRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isProcessing) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="apna-modal-overlay"
      onClick={() => {
        if (!isProcessing) onClose();
      }}
      role="presentation"
    >
      <div
        className="apna-modal-container"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-logout-title"
        aria-describedby="confirm-logout-desc"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          type="button"
          className="apna-modal-close-btn"
          onClick={() => {
            if (!isProcessing) onClose();
          }}
          aria-label="Close dialog"
          disabled={isProcessing}
        >
          <X size={18} />
        </button>

        {/* Modal Icon Badge */}
        <div className="apna-modal-icon-badge danger">
          <LogOut size={24} />
        </div>

        {/* Modal Title & Message */}
        <div className="apna-modal-body">
          <h2 id="confirm-logout-title" className="apna-modal-title">
            Confirm Logout
          </h2>
          <p id="confirm-logout-desc" className="apna-modal-desc">
            Are you sure you want to log out of Apna Campus?
          </p>
        </div>

        {/* Modal Actions */}
        <div className="apna-modal-actions">
          <button
            type="button"
            ref={cancelBtnRef}
            className="apna-btn apna-btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="apna-btn apna-btn-danger"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
