import React, { useEffect, useState } from 'react';
import { AlertCircle, BookOpen, BookmarkPlus, RefreshCw } from 'lucide-react';
import api from '../services/api.js';

export default function LibraryBooksView() {
  const [books, setBooks] = useState([]);
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: '', message: '' });
    api.getLibraryBooks(search)
      .then((result) => {
        if (!result?.success || !Array.isArray(result.data)) throw new Error('The server returned an invalid library catalog response.');
        if (active) setBooks(result.data);
      })
      .catch((error) => { if (active) setState({ loading: false, error: error.message || 'The library catalog could not be loaded.', message: '' }); })
      .finally(() => { if (active) setState((current) => ({ ...current, loading: false })); });
    return () => { active = false; };
  }, [search, refreshKey]);

  const reserve = async (book) => {
    try {
      const result = await api.createLibraryReservation({ bookTitle: book.title, isbn: book.isbn });
      if (!result?.success) throw new Error('The server did not confirm the reservation.');
      setState({ loading: false, error: '', message: result.message || 'Reservation submitted.' });
    } catch (error) {
      setState({ loading: false, error: error.message || 'Reservation was not saved.', message: '' });
    }
  };

  return (
    <section style={{ padding: 20, border: '1px solid #dbe4ef', borderRadius: 14, background: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem' }}><BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Library catalog</h2>
        <button type="button" onClick={() => setRefreshKey((key) => key + 1)} aria-label="Refresh library catalog"><RefreshCw size={15} /></button>
      </header>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author, or ISBN" aria-label="Search library catalog" style={{ width: '100%', boxSizing: 'border-box', margin: '14px 0', padding: 10, border: '1px solid #cbd5e1', borderRadius: 9 }} />
      {state.error && <p role="alert" style={{ color: '#991b1b' }}><AlertCircle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />{state.error}</p>}
      {state.message && <p role="status" style={{ color: '#166534' }}>{state.message}</p>}
      {state.loading ? <p role="status">Loading catalog…</p> : books.length === 0 ? <p role="status" style={{ color: '#64748b' }}>No books are recorded in the library catalog.</p> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {books.map((book) => <article key={book.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 13, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <div><strong>{book.title}</strong><div style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>{book.author} · ISBN {book.isbn || 'not recorded'} · {book.availableCopies ?? '—'} available</div></div>
            <button type="button" onClick={() => reserve(book)} disabled={!book.isbn || book.availableCopies === 0} style={{ padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', cursor: 'pointer' }}><BookmarkPlus size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />Reserve</button>
          </article>)}
        </div>
      )}
    </section>
  );
}
