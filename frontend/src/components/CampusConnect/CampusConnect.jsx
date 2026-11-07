import React from 'react';
import SomeshChatInterface from './SomeshChatInterface.jsx';

/**
 * CampusConnect — Upgraded to Somesh Chat Interface (somesh310/chat-interfce)
 * Replaces legacy WhatsApp clone with modern enterprise college chat interface.
 */
export default function CampusConnect({
  account,
  initialConversationId,
  isDrawerMode = false,
  onNavigateToModule,
  onBack,
  onClose,
  ...rest
}) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigateToModule) {
      onNavigateToModule('dashboard');
    } else if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <SomeshChatInterface
      account={account}
      initialConversationId={initialConversationId}
      isDrawerMode={isDrawerMode}
      onBack={handleBack}
      onClose={onClose}
      {...rest}
    />
  );
}

export { SomeshChatInterface };
