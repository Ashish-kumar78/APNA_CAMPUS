import { CreditCard, ShieldAlert } from 'lucide-react';
import './IDCardPage.css';

export default function IDCardPage() {
  return (
    <main className="idcard-page" role="status" aria-live="polite">
      <header className="idcard-header">
        <div>
          <h1 className="idcard-title"><CreditCard size={23} style={{ verticalAlign: 'middle', marginRight: 8 }} />Campus Identity Card</h1>
          <p className="idcard-subtitle">Identity cards can be shown here after a verified student profile and card issuance service are connected.</p>
        </div>
      </header>
      <section className="idcard-instructions" style={{ maxWidth: 760, background: '#fff', border: '1px solid #dbe4ef', borderRadius: 14, padding: 22 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}><ShieldAlert size={19} />Card unavailable</h2>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          This project does not yet issue verified identity cards, RFID credentials, or NFC access passes. The previous preview used sample student details and simulated a gate tap; those actions did not verify identity or grant campus access. No card is available to download.
        </p>
      </section>
    </main>
  );
}
