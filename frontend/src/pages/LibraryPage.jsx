import { useState, useEffect, useMemo } from 'react'
import {
  AlertCircle,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Download,
  LibraryBig,
  Search,
  Star,
  User,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import './LibraryPage.css'
import api from '../services/api'
import LibraryBooksView from '../components/LibraryBooksView'

const categories = ['All', 'Algorithms', 'Systems', 'Databases', 'AI/ML', 'Networks', 'Software Engineering']

export default function LibraryPage({ account }) {
  const [activeTab, setActiveTab] = useState('erp-library')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [catalog, setCatalog] = useState([])
  const [myLoans, setMyLoans] = useState([])
  const [reservedBooks, setReservedBooks] = useState({})
  const [reserveMsg, setReserveMsg] = useState('')

  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLibraryData() {
      try {
        const [booksRes, txnsRes] = await Promise.allSettled([
          api.getLibraryBooks(),
          api.getLibraryTransactions(),
        ])

        if (booksRes.status === 'fulfilled' && Array.isArray(booksRes.value?.data)) {
          setCatalog(booksRes.value.data)
        } else {
          setLoadError(booksRes.status === 'rejected' ? 'The library catalog could not be loaded.' : 'The library server returned an invalid catalog response.')
        }

        if (txnsRes.status === 'fulfilled' && txnsRes.value?.data) {
          setMyLoans(txnsRes.value.data)
        } else {
          setLoadError((current) => current || 'Your library loans could not be loaded.')
        }
      } catch (err) {
        setLoadError(err.message || 'Library data could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [account?.identity])

  const filteredBooks = useMemo(() => {
    return catalog.filter((book) => {
      const q = searchQuery.toLowerCase()
      const matchQuery =
        !q ||
        book.title.toLowerCase().includes(q) ||
        (book.author && book.author.toLowerCase().includes(q)) ||
        (book.isbn && book.isbn.includes(q))
      const matchCat =
        selectedCategory === 'All' ||
        (book.category && book.category.toLowerCase() === selectedCategory.toLowerCase())
      return matchQuery && matchCat
    })
  }, [catalog, searchQuery, selectedCategory])

  const activeIssuedBooks = useMemo(() => {
    return myLoans.filter((l) => l.status !== 'Returned')
  }, [myLoans])

  const returnedHistory = useMemo(() => {
    return myLoans.filter((l) => l.status === 'Returned')
  }, [myLoans])

  const totalFinePending = useMemo(() => {
    return activeIssuedBooks.reduce((sum, item) => sum + (Number(item.fineAmount) || 0), 0)
  }, [activeIssuedBooks])

  async function handleReserveBook(book) {
    if (book.availableCopies === 0) return
    try {
      const result = await api.createLibraryReservation({
        bookTitle: book.title,
        isbn: book.isbn,
        studentName: account?.name,
      })
      if (!result?.success) throw new Error('The server did not confirm the reservation.')

      setReservedBooks((prev) => ({ ...prev, [book.id]: true }))
      setReserveMsg(result.message || `"${book.title}" reservation submitted.`)
      setTimeout(() => setReserveMsg(''), 6000)
    } catch (error) {
      setReserveMsg(error.message || 'The reservation was not saved.')
    }
  }

  async function handleRenewBook(issue) {
    try {
      const res = await api.renewLibraryBook(issue.id)
      if (!res?.success) throw new Error('The server did not confirm the renewal.')
      setReserveMsg(res.message || `Loan renewal submitted for "${issue.bookTitle}".`)
      setTimeout(() => setReserveMsg(''), 5000)
    } catch {
      setReserveMsg('Cannot renew: Overdue fine pending or reservation exists on this title.')
      setTimeout(() => setReserveMsg(''), 5000)
    }
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <div>
          <p className="library-kicker"><LibraryBig size={13} />CAMPUS CENTRAL LIBRARY</p>
          <h2>Central Library & Learning Resources</h2>
          <p className="library-caption">Search bibliographic catalog, manage active borrowings, reserve physical copies, and access e-books.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('erp-library')}
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <BookOpen size={14} />
            View Library of Books
          </button>
          <div className="library-hours"><Clock size={13} /><div><strong>Library hours</strong><small>Check with the library for current opening hours.</small></div></div>
        </div>
      </div>

      {loadError && <div role="alert" style={{ marginBottom: 14, padding: 12, border: '1px solid #fecaca', borderRadius: 9, color: '#991b1b' }}>{loadError}</div>}
      {loading && <p role="status">Loading your library data…</p>}

      <div className="library-summary-strip">
        <div><BookOpen size={16} /><strong>{loading ? '—' : activeIssuedBooks.length}</strong><small>Books Issued</small></div>
        <div>
          <AlertCircle size={16} />
          <strong style={{ color: totalFinePending > 0 ? '#c0392b' : '#16a34a' }}>
            {loading ? '—' : `₹${totalFinePending}`}
          </strong>
          <small>Fine Pending</small>
        </div>
        <div><BookMarked size={16} /><strong>—</strong><small>Reservation status</small></div>
        <div><ShieldCheck size={16} /><strong>—</strong><small>Eligibility data unavailable</small></div>
      </div>

      <div className="library-tabs" role="tablist">
        {[
          { key: 'erp-library', label: '📖 Library Books & Issue Portal' },
          { key: 'catalog', label: 'Visual Book Catalog' },
          { key: 'issued', label: `My Issued Books (${activeIssuedBooks.length})` },
          { key: 'history', label: 'Borrowing History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={activeTab === key ? 'active' : ''}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {reserveMsg && (
        <div className="library-reserve-msg">
          {reserveMsg}
        </div>
      )}

      {activeTab === 'erp-library' && (
        <LibraryBooksView />
      )}

      {activeTab === 'catalog' && (
        <div className="library-catalog">
          <div className="catalog-controls">
            <label className="library-search">
              <Search size={14} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, author, or ISBN..."
              />
            </label>
            <div className="catalog-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="book-grid">
            {filteredBooks.map((book) => {
              const isAvailable = (book.availableCopies !== undefined ? book.availableCopies : (book.available || 0)) > 0
              const availCount = book.availableCopies !== undefined ? book.availableCopies : (book.available || 0)
              const totalCount = book.totalCopies ?? book.total ?? null

              return (
                <div key={book.id} className={`book-card ${!isAvailable ? 'unavailable' : ''}`}>
                  <div className="book-card-icon">
                    <BookOpen size={28} />
                  </div>
                  <div className="book-card-body">
                    <span className="book-category">{book.category || 'General'}</span>
                    <h3>{book.title}</h3>
                    <p className="book-author"><User size={11} />{book.author} · {book.edition || '1st'} Edition</p>
                    <div className="book-availability">
                      <span className={isAvailable ? 'available' : 'not-available'}>
                        {isAvailable ? `${availCount} available` : 'Stack Out of Stock'}
                      </span>
                      <small>({totalCount == null ? 'copy count unavailable' : `${totalCount} copies`} · {book.shelfLocation || 'Shelf not recorded'})</small>
                    </div>
                  </div>
                  <div className="book-card-actions">
                    {reservedBooks[book.id] ? (
                      <span className="book-reserved"><Check size={12} />Reserved</span>
                    ) : (
                      <button
                        className="book-reserve-btn"
                        disabled={!isAvailable}
                        onClick={() => handleReserveBook(book)}
                      >
                        {!isAvailable ? 'Unavailable' : 'Reserve'}
                        {isAvailable && <ChevronRight size={12} />}
                      </button>
                    )}
                    {book.fileUrl ? <a className="book-detail-btn" href={book.fileUrl} download><Download size={12} />E-Copy</a> : <span className="book-detail-btn" aria-disabled="true">No e-copy attached</span>}
                  </div>
                </div>
              )
            })}
            {filteredBooks.length === 0 && (
              <p className="library-empty">No books match your search or filter.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="library-issued">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            <button
              type="button"
              className="btn-view-library-books"
              onClick={() => setActiveTab('erp-library')}
              style={{
                backgroundColor: '#333333',
                color: '#ffffff',
                border: '1px solid #222222',
                borderRadius: '3px',
                padding: '7px 18px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              View Library of Books
            </button>
          </div>
          {activeIssuedBooks.length === 0 ? (
            <div className="library-empty-state">
              <BookOpen size={32} />
              <strong>No books currently issued</strong>
              <p>Browse the catalog to borrow or reserve books from the counter.</p>
            </div>
          ) : (
            <div className="issued-list">
              {activeIssuedBooks.map((issue) => {
                const isOverdue = issue.status === 'Overdue' || (Number(issue.fineAmount) > 0)
                return (
                  <div key={issue.id} className={`issued-card ${isOverdue ? 'overdue' : 'issued'}`}>
                    <div className="issued-icon"><BookOpen size={22} /></div>
                    <div className="issued-body">
                      <h3>{issue.bookTitle}</h3>
                      <div className="issued-meta">
                        <span><strong>Issued:</strong> {issue.issueDate}</span>
                        <span><strong>Due Date:</strong> {issue.dueDate}</span>
                      </div>
                      {Number(issue.fineAmount) > 0 && (
                        <div className="issued-fine">
                          <AlertCircle size={12} />
                          Overdue Fine: <strong>₹{issue.fineAmount}.00</strong> (Chargeable at ₹2/day)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={`issued-status-tag ${isOverdue ? 'overdue' : 'issued'}`}>
                        {isOverdue ? 'Overdue' : 'Issued'}
                      </span>
                      {!isOverdue && (
                        <button
                          type="button"
                          className="book-detail-btn"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          onClick={() => handleRenewBook(issue)}
                        >
                          <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} /> Renew (21d)
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {totalFinePending > 0 && (
                <div className="issued-total-fine">
                  <AlertCircle size={14} />
                  <span>Total late fine pending: <strong>₹{totalFinePending}.00</strong></span>
                  <button
                    className="pay-fine-btn"
                    onClick={() => {
                      alert(`Please visit the Central Library Circulation Counter or use Campus Smart Wallet to clear outstanding balance of ₹${totalFinePending}.00.`)
                    }}
                  >
                    Clear Fine
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="library-history">
          <div className="history-table-wrap">
            <table className="library-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Fine Assessed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnedHistory.length > 0 ? (
                  returnedHistory.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td><strong>{item.bookTitle}</strong></td>
                      <td>{item.issueDate}</td>
                      <td>{item.returnDate || 'Returned'}</td>
                      <td>₹{item.fineAmount || 0}</td>
                      <td><span className="history-status returned">Returned</span></td>
                    </tr>
                  ))
                ) : <tr><td colSpan={6}>{loading ? 'Loading loan history…' : 'No returned library loans found.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
