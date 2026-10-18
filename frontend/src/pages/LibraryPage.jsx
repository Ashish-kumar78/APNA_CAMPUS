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
import { downloadLibraryBookPdf } from '../utils/pdfGenerator'
import './LibraryPage.css'
import api from '../services/api'
import { erpStore } from '../services/erpStore'
import LibraryBooksView from '../components/LibraryBooksView'

const categories = ['All', 'Algorithms', 'Systems', 'Databases', 'AI/ML', 'Networks', 'Software Engineering']

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('erp-library')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [catalog, setCatalog] = useState(() => erpStore.getBooksCatalog())
  const [myLoans, setMyLoans] = useState([])
  const [reservedBooks, setReservedBooks] = useState({})
  const [reserveMsg, setReserveMsg] = useState('')

  const studentRoll = '2305201001'
  const studentName = 'Rakesh Das'

  useEffect(() => {
    async function fetchLibraryData() {
      try {
        const [booksRes, txnsRes] = await Promise.allSettled([
          api.getLibraryBooks(),
          api.getLibraryTransactions(studentRoll),
        ])

        if (booksRes.status === 'fulfilled' && booksRes.value?.data?.length > 0) {
          setCatalog(booksRes.value.data)
        } else {
          setCatalog(erpStore.getBooksCatalog())
        }

        if (txnsRes.status === 'fulfilled' && txnsRes.value?.data) {
          setMyLoans(txnsRes.value.data)
        } else {
          const localCircs = erpStore.getCirculationRecords().filter(
            (c) => c.borrowerRegNo === studentRoll || c.studentRoll === studentRoll
          )
          setMyLoans(localCircs)
        }
      } catch (err) {
        console.warn('Student Library page sync fallback:', err)
      }
    }

    fetchLibraryData()
  }, [])

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
      await api.createLibraryReservation({
        bookTitle: book.title,
        isbn: book.isbn,
        studentName,
        studentRoll,
      }).catch(() => null)

      erpStore.addLibraryReservation({
        bookTitle: book.title,
        isbn: book.isbn,
        studentName,
        studentRoll,
      })

      setReservedBooks((prev) => ({ ...prev, [book.id]: true }))
      setReserveMsg(`"${book.title}" reserved! Please collect it from Central Library Counter within 48 hours.`)
      setTimeout(() => setReserveMsg(''), 6000)
    } catch {
      setReserveMsg('Failed to process reservation.')
    }
  }

  async function handleRenewBook(issue) {
    try {
      const res = await api.renewLibraryBook(issue.id).catch(() => null)
      if (res?.success) {
        setReserveMsg(`Loan renewed for "${issue.bookTitle}"! New due date assigned.`)
      } else {
        erpStore.renewBook(issue.id)
        setReserveMsg(`Loan renewed for "${issue.bookTitle}"! Extended by 21 days.`)
      }
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
          <div className="library-hours">
            <Clock size={13} />
            <div>
              <strong>Library Hours</strong>
              <small>Mon–Sat: 8 AM – 8 PM &nbsp;|&nbsp; Sun: 10 AM – 4 PM</small>
            </div>
          </div>
        </div>
      </div>

      {/* Official Central Library Channel Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LibraryBig size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>📢 Central Library Official Broadcast Channel</strong>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Book return grace period reminders, IEEE digital subscriptions, and extended reading room hours are updated live in Campus Connect.</span>
          </div>
        </div>
        <button
          type="button"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('cms_navigate_chat', { detail: { convId: 'conv-library' } }))
          }}
        >
          Open Library Channel →
        </button>
      </div>

      <div className="library-summary-strip">
        <div><BookOpen size={16} /><strong>{activeIssuedBooks.length}</strong><small>Books Issued</small></div>
        <div>
          <AlertCircle size={16} />
          <strong style={{ color: totalFinePending > 0 ? '#c0392b' : '#16a34a' }}>
            ₹{totalFinePending}
          </strong>
          <small>Fine Pending</small>
        </div>
        <div><BookMarked size={16} /><strong>{Object.keys(reservedBooks).length}</strong><small>Reserved</small></div>
        <div><ShieldCheck size={16} /><strong style={{ color: '#059669' }}>Eligible</strong><small>Quota: 3 Books</small></div>
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
          <Check size={13} />{reserveMsg}
        </div>
      )}

      {activeTab === 'erp-library' && (
        <LibraryBooksView
          studentRoll={studentRoll}
          studentName={studentName}
          activeIssuedBooks={activeIssuedBooks}
          initialView="issued"
        />
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
              const totalCount = book.totalCopies !== undefined ? book.totalCopies : (book.total || 5)

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
                      <small>({totalCount} in stack · {book.shelfLocation || 'Stack 1'})</small>
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
                    <button className="book-detail-btn" onClick={() => downloadLibraryBookPdf(book)}>
                      <Download size={12} />E-Copy
                    </button>
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
                ) : (
                  [
                    ['BK001', 'Introduction to Algorithms (CLRS)', '01 Aug 2026', '22 Aug 2026', '₹0', 'Returned'],
                    ['BK002', 'Computer Networks (Tanenbaum)', '10 Jul 2026', '02 Aug 2026', '₹0', 'Returned'],
                    ['BK003', 'Database System Concepts (Silberschatz)', '15 Jun 2026', '06 Jul 2026', '₹0', 'Returned'],
                  ].map(([id, title, issue, ret, fine, status], idx) => (
                    <tr key={id}>
                      <td>{idx + 1}</td>
                      <td><strong>{title}</strong></td>
                      <td>{issue}</td>
                      <td>{ret}</td>
                      <td>{fine}</td>
                      <td><span className="history-status returned">{status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
