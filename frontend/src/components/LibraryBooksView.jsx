import React, { useState, useMemo } from 'react';
import {
  List,
  ArrowUpDown,
  BookOpen,
  RotateCcw,
  Search,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import './LibraryBooksView.css';

// ── Complete Catalog of Available Books (Page 1 matches exact 20 items from Image 2) ──
export const INITIAL_AVAILABLE_BOOKS = [
  // Page 1 (Exact 20 books from User Image 2)
  { id: 1, bookNumber: '2207', bookName: '.NET AND J2EE INTEROPERABILITY', author: 'Peltzer Dwight', cost: 'RS. 395.00', almira: 'A8' },
  { id: 2, bookNumber: '2698', bookName: '.NET INTERVIEW QUESTIONS', author: 'Koirala Shiv Prasad', cost: 'RS. 198.00', almira: 'A8' },
  { id: 3, bookNumber: '2555', bookName: "'A' LEVEL MADE SIMPLE BASIC OF OS, UNIX & SHELL PR", author: 'Jain/Pallai', cost: 'RS. 150.00', almira: 'A10' },
  { id: 4, bookNumber: '2430', bookName: "'A' LEVEL MADE SIMPLE DATA STRUCTURE THROUGH 'C' L", author: 'Jain/Singh', cost: 'RS. 150.00', almira: 'A11' },
  { id: 5, bookNumber: '2433', bookName: "'A' LEVEL MADE SIMPLE INTRODUCTION TO OBJECT ORIEN", author: 'Jain/Pallai', cost: 'RS. 120.00', almira: 'A7' },
  { id: 6, bookNumber: '2431', bookName: "'A' LEVEL MADE STRUCTURED SYSTEM ANALYSIS AND DESI", author: 'Jain/Pallai', cost: 'RS. 150.00', almira: 'A2' },
  { id: 7, bookNumber: '2556', bookName: "'O' LEVEL MADE SIMPLE PROGRAMMING AND PROBLEM SOLV", author: 'Jain/Singh', cost: 'RS. 195.00', almira: 'A8' },
  { id: 8, bookNumber: '2432', bookName: "'O' LEVEL MADE SIMPLE PROGRAMMING THROUGH VISUAL B", author: 'Jain/Sharma/Jain', cost: 'RS. 120.00', almira: 'A7' },
  { id: 9, bookNumber: '28888', bookName: '+2 SAMPLE PAPER CHEMISTRY', author: 'MISHRA ,P.K', cost: 'RS. 110.00', almira: 'A8' },
  { id: 10, bookNumber: '28890', bookName: '+2 SAMPLE PAPER PHYSICS', author: 'MISHRA ,P.K', cost: 'RS. 105.00', almira: 'A7' },
  { id: 11, bookNumber: '688', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 12, bookNumber: '689', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 13, bookNumber: '692', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 14, bookNumber: '683', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 15, bookNumber: '679', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 16, bookNumber: '691', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 17, bookNumber: '680', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 18, bookNumber: '687', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 19, bookNumber: '686', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },
  { id: 20, bookNumber: '690', bookName: '0000-8085 : INTRODUCTION TO MICROPROCESOR FOR ENGI', author: 'Ghosh/Sridhar', cost: 'RS. 250.00', almira: 'A2' },

  // Page 2 (Items 21-40)
  { id: 21, bookNumber: '3101', bookName: 'INTRODUCTION TO ALGORITHMS (3RD EDITION)', author: 'Cormen/Leiserson/Rivest', cost: 'RS. 895.00', almira: 'A3' },
  { id: 22, bookNumber: '3102', bookName: 'DESIGN AND ANALYSIS OF COMPUTER ALGORITHMS', author: 'Aho/Hopcroft/Ullman', cost: 'RS. 450.00', almira: 'A3' },
  { id: 23, bookNumber: '3103', bookName: 'DATABASE SYSTEM CONCEPTS (6TH EDITION)', author: 'Silberschatz/Korth/Sudarshan', cost: 'RS. 720.00', almira: 'A4' },
  { id: 24, bookNumber: '3104', bookName: 'FUNDAMENTALS OF DATABASE SYSTEMS', author: 'Elmasri/Navathe', cost: 'RS. 680.00', almira: 'A4' },
  { id: 25, bookNumber: '3105', bookName: 'COMPUTER NETWORKS: A TOP-DOWN APPROACH', author: 'Kurose/Ross', cost: 'RS. 625.00', almira: 'A5' },
  { id: 26, bookNumber: '3106', bookName: 'COMPUTER NETWORKS (5TH EDITION)', author: 'Tanenbaum/Wetherall', cost: 'RS. 595.00', almira: 'A5' },
  { id: 27, bookNumber: '3107', bookName: 'OPERATING SYSTEM CONCEPTS', author: 'Silberschatz/Galvin/Gagne', cost: 'RS. 650.00', almira: 'A6' },
  { id: 28, bookNumber: '3108', bookName: 'MODERN OPERATING SYSTEMS', author: 'Tanenbaum/Bos', cost: 'RS. 710.00', almira: 'A6' },
  { id: 29, bookNumber: '3109', bookName: 'ARTIFICIAL INTELLIGENCE: A MODERN APPROACH', author: 'Russell/Norvig', cost: 'RS. 950.00', almira: 'A9' },
  { id: 30, bookNumber: '3110', bookName: 'PATTERN RECOGNITION AND MACHINE LEARNING', author: 'Bishop Christopher', cost: 'RS. 820.00', almira: 'A9' },
  { id: 31, bookNumber: '3111', bookName: 'SOFTWARE ENGINEERING: A PRACTITIONER APPROACH', author: 'Pressman Roger', cost: 'RS. 580.00', almira: 'A8' },
  { id: 32, bookNumber: '3112', bookName: 'OBJECT-ORIENTED SOFTWARE ENGINEERING', author: 'Sommerville Ian', cost: 'RS. 520.00', almira: 'A8' },
  { id: 33, bookNumber: '3113', bookName: 'DIGITAL LOGIC AND COMPUTER DESIGN', author: 'Mano M. Morris', cost: 'RS. 410.00', almira: 'A2' },
  { id: 34, bookNumber: '3114', bookName: 'COMPUTER ORGANIZATION AND ARCHITECTURE', author: 'Stallings William', cost: 'RS. 540.00', almira: 'A2' },
  { id: 35, bookNumber: '3115', bookName: 'COMPILERS: PRINCIPLES, TECHNIQUES & TOOLS', author: 'Aho/Lam/Sethi/Ullman', cost: 'RS. 740.00', almira: 'A3' },
  { id: 36, bookNumber: '3116', bookName: 'THE C PROGRAMMING LANGUAGE (ANSI C)', author: 'Kernighan/Ritchie', cost: 'RS. 280.00', almira: 'A11' },
  { id: 37, bookNumber: '3117', bookName: 'PROGRAMMING IN ANSI C (7TH EDITION)', author: 'Balagurusamy E.', cost: 'RS. 395.00', almira: 'A11' },
  { id: 38, bookNumber: '3118', bookName: 'CORE JAVA VOLUME I - FUNDAMENTALS', author: 'Horstmann Cay', cost: 'RS. 675.00', almira: 'A8' },
  { id: 39, bookNumber: '3119', bookName: 'PYTHON CRASH COURSE (2ND EDITION)', author: 'Matthes Eric', cost: 'RS. 520.00', almira: 'A7' },
  { id: 40, bookNumber: '3120', bookName: 'LEARNING PYTHON (5TH EDITION)', author: 'Lutz Mark', cost: 'RS. 890.00', almira: 'A7' },

  // Page 3 (Items 41-60)
  { id: 41, bookNumber: '3201', bookName: 'HIGHER ENGINEERING MATHEMATICS (44TH ED)', author: 'Grewal B.S.', cost: 'RS. 750.00', almira: 'A1' },
  { id: 42, bookNumber: '3202', bookName: 'ADVANCED ENGINEERING MATHEMATICS', author: 'Kreyszig Erwin', cost: 'RS. 820.00', almira: 'A1' },
  { id: 43, bookNumber: '3203', bookName: 'DISCRETE MATHEMATICS AND ITS APPLICATIONS', author: 'Rosen Kenneth', cost: 'RS. 680.00', almira: 'A1' },
  { id: 44, bookNumber: '3204', bookName: 'ENGINEERING PHYSICS (VOLUME I & II)', author: 'Gaur/Gupta', cost: 'RS. 495.00', almira: 'A7' },
  { id: 45, bookNumber: '3205', bookName: 'CONCEPTS OF MODERN PHYSICS', author: 'Beiser Arthur', cost: 'RS. 540.00', almira: 'A7' },
  { id: 46, bookNumber: '3206', bookName: 'ELECTRONIC DEVICES AND CIRCUIT THEORY', author: 'Boylestad/Nashelsky', cost: 'RS. 630.00', almira: 'A2' },
  { id: 47, bookNumber: '3207', bookName: 'SIGNALS AND SYSTEMS (2ND EDITION)', author: 'Oppenheim/Willsky', cost: 'RS. 710.00', almira: 'A2' },
  { id: 48, bookNumber: '3208', bookName: 'DIGITAL SIGNAL PROCESSING: PRINCIPLES', author: 'Proakis/Manolakis', cost: 'RS. 690.00', almira: 'A2' },
  { id: 49, bookNumber: '3209', bookName: 'CONTROL SYSTEMS ENGINEERING (7TH EDITION)', author: 'Nise Norman', cost: 'RS. 675.00', almira: 'A2' },
  { id: 50, bookNumber: '3210', bookName: 'MODERN CONTROL ENGINEERING', author: 'Ogata Katsuhiko', cost: 'RS. 720.00', almira: 'A2' },
  { id: 51, bookNumber: '3211', bookName: 'BASIC ELECTRICAL ENGINEERING', author: 'Kothari/Nagrath', cost: 'RS. 450.00', almira: 'A5' },
  { id: 52, bookNumber: '3212', bookName: 'ELECTRIC CIRCUITS (10TH EDITION)', author: 'Nilsson/Riedel', cost: 'RS. 590.00', almira: 'A5' },
  { id: 53, bookNumber: '3213', bookName: 'COMMUNICATION SYSTEMS (4TH EDITION)', author: 'Haykin Simon', cost: 'RS. 610.00', almira: 'A5' },
  { id: 54, bookNumber: '3214', bookName: 'VLSI DESIGN TECHNIQUES FOR ANALOG & DIGITAL', author: 'Geiger/Allen/Strader', cost: 'RS. 580.00', almira: 'A2' },
  { id: 55, bookNumber: '3215', bookName: 'PRINCIPLES OF CMOS VLSI DESIGN', author: 'Weste/Eshraghian', cost: 'RS. 640.00', almira: 'A2' },
  { id: 56, bookNumber: '3216', bookName: 'DATA COMMUNICATIONS AND NETWORKING', author: 'Forouzan Behrouz', cost: 'RS. 660.00', almira: 'A5' },
  { id: 57, bookNumber: '3217', bookName: 'CRYPTOGRAPHY AND NETWORK SECURITY', author: 'Stallings William', cost: 'RS. 620.00', almira: 'A5' },
  { id: 58, bookNumber: '3218', bookName: 'CLOUD COMPUTING: PRINCIPLES AND PARADIGMS', author: 'Buyya Rajkumar', cost: 'RS. 595.00', almira: 'A8' },
  { id: 59, bookNumber: '3219', bookName: 'INTERNET OF THINGS: A HANDS-ON APPROACH', author: 'Bahga/Madisetti', cost: 'RS. 530.00', almira: 'A9' },
  { id: 60, bookNumber: '3220', bookName: 'BIG DATA: PRINCIPLES AND BEST PRACTICES', author: 'Marz/Warren', cost: 'RS. 570.00', almira: 'A9' },

  // Additional pages up to 200 items (10 pages of 20)
  ...Array.from({ length: 140 }, (_, i) => {
    const idx = 61 + i;
    const almiraList = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11'];
    const authors = [
      'Tanenbaum Andrew', 'Stallings William', 'Silberschatz Abraham', 'Grewal B.S.',
      'Balagurusamy E.', 'Forouzan Behrouz', 'Russell Stuart', 'Pressman Roger',
      'Peltzer Dwight', 'Ghosh/Sridhar', 'Jain/Pallai', 'MISHRA ,P.K'
    ];
    return {
      id: idx,
      bookNumber: String(4000 + idx),
      bookName: `TECHNICAL REFERENCE & ENGINEERING SERIES VOL ${idx}`,
      author: authors[idx % authors.length],
      cost: `RS. ${(180 + (idx % 12) * 45)}.00`,
      almira: almiraList[idx % almiraList.length]
    };
  })
];

export default function LibraryBooksView({
  studentRoll = '2305201001',
  studentName = 'Rakesh Das',
  activeIssuedBooks = [],
  initialView = 'issued',
  onSwitchView = null
}) {
  // View mode: 'issued' (Image 1) or 'available' (Image 2)
  const [currentView, setCurrentView] = useState(initialView);

  // Sorting for Available Books table ('none' preserves exact sequence from Image 2)
  const [sortOrder, setSortOrder] = useState('none'); // 'none' | 'asc' | 'desc'

  // Subheader Column Filters (Image 2)
  const [filters, setFilters] = useState({
    bookNumber: '',
    bookName: '',
    author: '',
    almira: ''
  });

  // Pagination state (Image 2 shows 10 pages)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Notification message
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Convert activeIssuedBooks into ERP format or empty
  const issuedList = useMemo(() => {
    if (activeIssuedBooks && activeIssuedBooks.length > 0) {
      return activeIssuedBooks.map((item, idx) => ({
        id: item.id || idx + 1,
        issuedAt: item.issueDate || '12 Oct 2026',
        bookNo: item.bookNo || item.bookNumber || item.isbn || String(2200 + idx),
        bookName: item.bookTitle || item.title || item.name || 'Sample Book',
        issueType: item.issueType || 'Normal Loan',
        returnDueDate: item.dueDate || item.returnDueDate || '02 Nov 2026',
        returnedAt: item.returnDate || item.returnedAt || '-',
        daysOverdue: item.daysOverdue || 0,
        fine: item.fineAmount || item.fine || 0,
      }));
    }
    return [];
  }, [activeIssuedBooks]);

  // Filter and sort available books
  const filteredAvailableBooks = useMemo(() => {
    let result = INITIAL_AVAILABLE_BOOKS.filter((b) => {
      if (filters.bookNumber && !b.bookNumber.toLowerCase().includes(filters.bookNumber.trim().toLowerCase())) {
        return false;
      }
      if (filters.bookName && !b.bookName.toLowerCase().includes(filters.bookName.trim().toLowerCase())) {
        return false;
      }
      if (filters.author && filters.author !== '' && b.author !== filters.author) {
        return false;
      }
      if (filters.almira && filters.almira !== '' && b.almira !== filters.almira) {
        return false;
      }
      return true;
    });

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.bookName.localeCompare(b.bookName));
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.bookName.localeCompare(a.bookName));
    }

    return result;
  }, [filters, sortOrder]);

  // Pagination slices
  const totalPages = Math.max(1, Math.ceil(filteredAvailableBooks.length / pageSize));
  const currentBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAvailableBooks.slice(start, start + pageSize);
  }, [filteredAvailableBooks, currentPage, pageSize]);

  // Unique authors and almiras for select dropdowns
  const uniqueAuthors = useMemo(() => {
    return Array.from(new Set(INITIAL_AVAILABLE_BOOKS.map((b) => b.author))).sort();
  }, []);

  const uniqueAlmiras = useMemo(() => {
    return Array.from(new Set(INITIAL_AVAILABLE_BOOKS.map((b) => b.almira))).sort();
  }, []);

  const handleSortToggle = () => {
    setSortOrder((prev) => {
      if (prev === 'none') return 'asc';
      if (prev === 'asc') return 'desc';
      return 'none';
    });
  };

  return (
    <div className="library-books-erp-container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="library-reserve-msg" style={{ marginBottom: '12px' }}>
          <CheckCircle2 size={15} color="#16a34a" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: MY ISSUED BOOKS (EXACT SCREENSHOT IMAGE 1 MATCH)
          ───────────────────────────────────────────────────────────── */}
      {currentView === 'issued' && (
        <div className="library-issued-view-section">
          {/* Top Right Button: [View Library of Books] */}
          <div className="library-erp-top-bar">
            <button
              type="button"
              className="btn-view-library-books"
              onClick={() => {
                setCurrentView('available');
                setCurrentPage(1);
              }}
              title="Browse all available books in central library"
            >
              View Library of Books
            </button>
          </div>

          {/* Issued Books Table */}
          <div className="library-table-card">
            <table className="library-erp-table" aria-label="Issued Books Table">
              <thead>
                <tr className="header-row">
                  <th className="col-lib-num">#</th>
                  <th className="sortable-th" onClick={handleSortToggle} title="Sort by issue date">
                    Issued At <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 2 }} />
                  </th>
                  <th>Book No.</th>
                  <th>Book Name</th>
                  <th>Issue Type</th>
                  <th>Return Due Date</th>
                  <th>Returned at</th>
                  <th>Days Overdue</th>
                  <th>Estimated Fine</th>
                </tr>
              </thead>
              <tbody>
                {issuedList.length === 0 ? (
                  <>
                    <tr>
                      <td colSpan={9} className="library-empty-cell">
                        No books issued yet.
                      </td>
                    </tr>
                    {/* Empty Ghost Grid Rows to match screenshot */}
                    <tr className="library-ghost-row">
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                      <td colSpan={1}>&nbsp;</td>
                    </tr>
                    <tr className="library-ghost-row">
                      <td colSpan={9}>&nbsp;</td>
                    </tr>
                  </>
                ) : (
                  issuedList.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="col-lib-num">{idx + 1}</td>
                      <td>{item.issuedAt || '-'}</td>
                      <td style={{ fontWeight: 600 }}>{item.bookNo}</td>
                      <td><strong>{item.bookName}</strong></td>
                      <td>{item.issueType || 'Normal Loan'}</td>
                      <td>{item.returnDueDate || '-'}</td>
                      <td>{item.returnedAt || '-'}</td>
                      <td style={{ color: item.daysOverdue > 0 ? '#dc2626' : '#475569', fontWeight: 600 }}>
                        {item.daysOverdue || 0}
                      </td>
                      <td style={{ color: item.fine > 0 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                        {item.fine ? `₹${item.fine}.00` : '₹0.00'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: AVAILABLE BOOKS IN LIBRARY (EXACT SCREENSHOT IMAGE 2)
          ───────────────────────────────────────────────────────────── */}
      {currentView === 'available' && (
        <div className="library-available-view-section">
          <div className="library-available-header-bar">
            <h3 className="library-available-title">
              <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="#333333">
                  <rect x="1" y="2" width="3.5" height="3" rx="0.5" />
                  <rect x="6" y="2" width="9" height="3" rx="0.5" />
                  <rect x="1" y="7" width="3.5" height="3" rx="0.5" />
                  <rect x="6" y="7" width="9" height="3" rx="0.5" />
                  <rect x="1" y="12" width="3.5" height="3" rx="0.5" />
                  <rect x="6" y="12" width="9" height="3" rx="0.5" />
                </svg>
              </span>
              <span>Available Books in Library</span>
            </h3>

            <button
              type="button"
              className="btn-view-issued-books"
              onClick={() => setCurrentView('issued')}
              title="Return to My Issued Books"
            >
              <RotateCcw size={13} />
              <span>Back to My Issued Books</span>
            </button>
          </div>

          {/* Table: # | Book Number | Book Name ⇅ | Author | Cost | Almira */}
          <div className="library-table-card">
            <table className="library-erp-table" aria-label="Available Books in Library">
              <thead>
                {/* Primary Header Row (Blue Text) */}
                <tr className="header-row">
                  <th className="col-lib-num">#</th>
                  <th className="col-lib-bookno">Book Number</th>
                  <th className="col-lib-title sortable-th" onClick={handleSortToggle} title="Click to sort by Book Name">
                    Book Name <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: 2 }} />
                  </th>
                  <th className="col-lib-author">Author</th>
                  <th className="col-lib-cost">Cost</th>
                  <th className="col-lib-almira">Almira</th>
                </tr>

                {/* Sub-Header Filter Row (Inputs and Selects Matching Screenshot) */}
                <tr className="filter-row">
                  <th className="col-lib-num" />
                  <th className="col-lib-bookno">
                    <input
                      type="text"
                      className="lib-filter-input"
                      value={filters.bookNumber}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, bookNumber: e.target.value }));
                        setCurrentPage(1);
                      }}
                      aria-label="Filter Book Number"
                    />
                  </th>
                  <th className="col-lib-title">
                    <input
                      type="text"
                      className="lib-filter-input"
                      value={filters.bookName}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, bookName: e.target.value }));
                        setCurrentPage(1);
                      }}
                      aria-label="Filter Book Name"
                    />
                  </th>
                  <th className="col-lib-author">
                    <select
                      className="lib-filter-select"
                      value={filters.author}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, author: e.target.value }));
                        setCurrentPage(1);
                      }}
                      aria-label="Filter Author"
                    >
                      <option value=""></option>
                      {uniqueAuthors.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="col-lib-cost" />
                  <th className="col-lib-almira">
                    <select
                      className="lib-filter-select"
                      value={filters.almira}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, almira: e.target.value }));
                        setCurrentPage(1);
                      }}
                      aria-label="Filter Almira"
                    >
                      <option value=""></option>
                      {uniqueAlmiras.map((alm) => (
                        <option key={alm} value={alm}>
                          {alm}
                        </option>
                      ))}
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      No available books found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  currentBooks.map((book, index) => {
                    const rowNumber = (currentPage - 1) * pageSize + (index + 1);
                    return (
                      <tr key={book.id || rowNumber}>
                        <td className="col-lib-num">{rowNumber}</td>
                        <td className="col-lib-bookno">{book.bookNumber}</td>
                        <td className="col-lib-title">
                          <span>{book.bookName}</span>
                        </td>
                        <td className="col-lib-author">{book.author}</td>
                        <td className="col-lib-cost">{book.cost}</td>
                        <td className="col-lib-almira">{book.almira}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls (< 1 2 3 4 5 6 7 8 9 10 > Matching Screenshot) */}
          <div className="library-pagination-wrapper">
            <div className="library-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                &lt;
              </button>

              {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={currentPage === pageNum ? 'active' : ''}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
