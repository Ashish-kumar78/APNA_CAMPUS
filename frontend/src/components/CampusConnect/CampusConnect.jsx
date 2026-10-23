import React from 'react';
import { MessageCircle, ShieldAlert } from 'lucide-react';

/**
 * Campus Connect has no canonical, persistent NestJS API yet. Keep its portal
 * entry visible, but do not expose the old in-memory Express/browser demo as a
 * live messaging service or claim that messages are saved.
 */
export default function CampusConnect() {
  return (
    <section
      role="status"
      aria-live="polite"
      style={{
        maxWidth: 760,
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #dbe4ef',
        borderRadius: 18,
        background: 'linear-gradient(145deg, #fff, #f5f8fc)',
        color: '#172033',
        boxShadow: '0 12px 32px rgba(15, 23, 42, .08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <MessageCircle size={24} aria-hidden="true" />
        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Campus Connect</h2>
      </div>
      <p style={{ margin: '0 0 1rem', lineHeight: 1.6, color: '#475569' }}>
        Messaging and community actions are temporarily unavailable while this feature is connected
        to the authenticated campus API. The previous demo did not save messages to the campus database.
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, color: '#76520a', fontSize: '.9rem' }}>
        <ShieldAlert size={18} aria-hidden="true" style={{ flex: '0 0 auto', marginTop: 2 }} />
        <span>No messages, contacts, announcements, or academic resources were sent or saved.</span>
      </div>
    </section>
  );
}
