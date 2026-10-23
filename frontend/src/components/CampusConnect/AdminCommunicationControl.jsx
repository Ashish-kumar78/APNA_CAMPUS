import React from 'react';
import { Megaphone, ShieldAlert } from 'lucide-react';

export default function AdminCommunicationControl() {
  return (
    <section role="status" aria-live="polite" style={{ padding: 24, border: '1px solid #dbe4ef', borderRadius: 16, background: '#fff', color: '#172033' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 0 }}><Megaphone size={21} />Campus communications</h2>
      <p style={{ color: '#475569', lineHeight: 1.6 }}>Broadcasts, groups, moderation reports, and engagement analytics are not connected to a persistent backend. The former controls wrote to browser-only state and could falsely claim an announcement was delivered.</p>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, color: '#76520a' }}><ShieldAlert size={17} />No message, group, or moderation action has been sent or saved.</p>
    </section>
  );
}
