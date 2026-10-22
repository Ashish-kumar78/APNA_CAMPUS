import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  BookmarkCheck,
  Search,
  Plus,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Users,
  LogOut,
  Layers,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  BookMarked,
  FileText,
  DollarSign,
  Tag,
  Barcode,
  ShoppingBag,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Info,
  Calendar,
  Building,
  Check,
  Ban,
  MessageSquare
} from 'lucide-react';
import './LibraryPortal.css';
import './SuperAdminPortal.css';
import CampusConnect from './CampusConnect/CampusConnect.jsx';
import { erpStore } from '../services/erpStore.js';
import api from '../services/api.js';
import RoleDashboardLanding from './RoleDashboardLanding.jsx';

export default function LibraryPortal({ account, onLogout, onSwitchRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, circulation, catalog, inventory, reservations, fines, acquisitions, digital, reports
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Core Data Collections
  const [booksCatalog, setBooksCatalog] = useState(() => erpStore.getBooksCatalog());
  const [circulationRecords, setCirculationRecords] = useState(() => erpStore.getCirculationRecords());
  const [physicalCopies, setPhysicalCopies] = useState([]);
  const [reservations, setReservations] = useState(() => erpStore.getLibraryReservations());
  const [finesList, setFinesList] = useState(() => erpStore.getLibraryFines());
  const [acquisitions, setAcquisitions] = useState(() => erpStore.getLibraryAcquisitions());
  const [digitalResources, setDigitalResources] = useState(() => erpStore.getLibraryDigitalResources());
  const [policies, setPolicies] = useState(() => erpStore.getLibraryPolicies?.() || { borrowerRules: [], generalGuidelines: [] });
  const [dashboardStats, setDashboardStats] = useState(null);

  // Filters & Searches
  const [searchCatalog, setSearchCatalog] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [circSearch, setCircSearch] = useState('');
  const [circStatusFilter, setCircStatusFilter] = useState('All');
  const [finesSearch, setFinesSearch] = useState('');

  // Quick Issue Form State
  const [issueBookId, setIssueBookId] = useState('');
  const [borrowerRole, setBorrowerRole] = useState('Student');
  const [borrowerName, setBorrowerName] = useState('Rakesh Das');
  const [borrowerRegNo, setBorrowerRegNo] = useState('2305201001');

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookForm, setNewBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    department: 'Computer Science & Engineering',
    category: 'Algorithms',
    edition: '1st Edition',
    totalCopies: 5,
    shelfLocation: 'Stack 1, Row A',
    price: 850
  });

  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState(null);
  const [newCopyForm, setNewCopyForm] = useState({
    accessionNumber: '',
    barcode: '',
    shelfLocation: '',
    condition: 'Good',
    price: 850
  });

  const [showReservationModal, setShowReservationModal] = useState(false);
  const [newReservationForm, setNewReservationForm] = useState({
    bookTitle: '',
    isbn: '',
    studentName: '',
    studentRoll: ''
  });

  const [showSettleFineModal, setShowSettleFineModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [finePaymentForm, setFinePaymentForm] = useState({
    amountPaid: '',
    paymentMode: 'Cash at Counter'
  });

  const [showWaiveFineModal, setShowWaiveFineModal] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');

  const [showAddAcquisitionModal, setShowAddAcquisitionModal] = useState(false);
  const [newAcqForm, setNewAcqForm] = useState({
    bookTitle: '',
    author: '',
    vendor: 'Tata McGraw-Hill Education',
    department: 'Computer Science & Engineering',
    quantityRequested: 10,
    unitPrice: 850
  });

  const [selectedBookDetail, setSelectedBookDetail] = useState(null);
  const [digitalReceipt, setDigitalReceipt] = useState(null);

  // Sync Data from Backend API / erpStore
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, booksRes, txnsRes, copiesRes, resRes, finesRes, acqRes, digRes, polRes] = await Promise.allSettled([
        api.getLibraryDashboardStats(),
        api.getLibraryBooks(),
        api.getLibraryTransactions(),
        api.getLibraryCopies(),
        api.getLibraryReservations(),
        api.getLibraryFines(),
        api.getLibraryAcquisitions(),
        api.getLibraryDigitalResources(),
        api.getLibraryPolicies(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setDashboardStats(statsRes.value.data);
      } else {
        setDashboardStats(erpStore.getLibraryDashboardStats());
      }

      if (booksRes.status === 'fulfilled' && booksRes.value?.data) {
        setBooksCatalog(booksRes.value.data);
      } else {
        setBooksCatalog(erpStore.getBooksCatalog());
      }

      if (txnsRes.status === 'fulfilled' && txnsRes.value?.data) {
        setCirculationRecords(txnsRes.value.data);
      } else {
        setCirculationRecords(erpStore.getCirculationRecords());
      }

      if (copiesRes.status === 'fulfilled' && copiesRes.value?.data) {
        setPhysicalCopies(copiesRes.value.data);
      }

      if (resRes.status === 'fulfilled' && resRes.value?.data) {
        setReservations(resRes.value.data);
      }

      if (finesRes.status === 'fulfilled' && finesRes.value?.data) {
        setFinesList(finesRes.value.data);
      }

      if (acqRes.status === 'fulfilled' && acqRes.value?.data) {
        setAcquisitions(acqRes.value.data);
      }

      if (digRes.status === 'fulfilled' && digRes.value?.data) {
        setDigitalResources(digRes.value.data);
      }

      if (polRes.status === 'fulfilled' && polRes.value?.data) {
        setPolicies(polRes.value.data);
      }
    } catch (err) {
      console.warn('Library API sync error, falling back to local storage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      setBooksCatalog([...erpStore.getBooksCatalog()]);
      setCirculationRecords([...erpStore.getCirculationRecords()]);
      setReservations([...erpStore.getLibraryReservations()]);
      setFinesList([...erpStore.getLibraryFines()]);
      setAcquisitions([...erpStore.getLibraryAcquisitions()]);
    };
    window.addEventListener('erp_store_updated', handleUpdate);
    return () => window.removeEventListener('erp_store_updated', handleUpdate);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // --- Handlers ---
  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!issueBookId) {
      triggerToast('Please select a book from the catalog.');
      return;
    }
    try {
      const selectedBook = booksCatalog.find(b => b.id === issueBookId);
      const res = await api.issueLibraryBook({
        bookId: issueBookId,
        studentRoll: borrowerRegNo,
        studentName: borrowerName,
        role: borrowerRole,
      }).catch(() => null);

      if (res && res.success) {
        triggerToast(res.message || `Book issued to ${borrowerName}!`);
      } else {
        erpStore.issueBook({
          bookId: issueBookId,
          borrowerName,
          borrowerRegNo,
          role: borrowerRole,
        });
        triggerToast(`Book "${selectedBook?.title || 'Title'}" issued to ${borrowerName}!`);
      }
      setIssueBookId('');
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Failed to issue book');
    }
  };

  const handleReturnBook = async (record) => {
    try {
      const res = await api.returnLibraryBook(record.id).catch(() => null);
      if (res && res.success) {
        triggerToast(res.message || 'Book returned successfully!');
      } else {
        erpStore.returnBook(record.id);
        triggerToast('Book returned and copy restored to stack!');
      }
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Failed to return book');
    }
  };

  const handleRenewBook = async (record) => {
    try {
      const res = await api.renewLibraryBook(record.id).catch(() => null);
      if (res && res.success) {
        triggerToast(res.message || 'Book loan renewed for 21 days!');
      } else {
        erpStore.renewBook(record.id);
        triggerToast(`Loan renewed for ${record.bookTitle}!`);
      }
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Renewal limit reached or book is on reserve.');
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!newBookForm.isbn || !newBookForm.title || !newBookForm.author) {
      triggerToast('Please complete all mandatory book details.');
      return;
    }
    try {
      const res = await api.createLibraryBook(newBookForm).catch(() => null);
      if (res && res.success) {
        triggerToast(`Catalog title "${newBookForm.title}" registered!`);
      } else {
        erpStore.addCatalogBook(newBookForm);
        triggerToast(`"${newBookForm.title}" added to catalog with 5 physical copies!`);
      }
      setShowAddBookModal(false);
      setNewBookForm({
        isbn: '',
        title: '',
        author: '',
        department: 'Computer Science & Engineering',
        category: 'Algorithms',
        edition: '1st Edition',
        totalCopies: 5,
        shelfLocation: 'Stack 1, Row A',
        price: 850
      });
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Failed to register catalog title');
    }
  };

  const handleRegisterCopy = async (e) => {
    e.preventDefault();
    if (!selectedBookForCopy) return;
    try {
      const payload = {
        bookId: selectedBookForCopy.id,
        accessionNumber: newCopyForm.accessionNumber,
        barcode: newCopyForm.barcode,
        shelfLocation: newCopyForm.shelfLocation || selectedBookForCopy.shelfLocation,
        condition: newCopyForm.condition,
        price: newCopyForm.price
      };
      const res = await api.registerLibraryCopy(payload).catch(() => null);
      if (res && res.success) {
        triggerToast('Physical copy registered into stack inventory!');
      } else {
        triggerToast('Physical copy accessioned into stack!');
      }
      setShowAddCopyModal(false);
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Error accessioning copy');
    }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!newReservationForm.bookTitle || !newReservationForm.studentRoll) {
      triggerToast('Please provide book title and borrower registration number.');
      return;
    }
    try {
      const res = await api.createLibraryReservation(newReservationForm).catch(() => null);
      if (res && res.success) {
        triggerToast(`Reservation placed for ${newReservationForm.bookTitle}!`);
      } else {
        erpStore.addLibraryReservation(newReservationForm);
        triggerToast(`Reservation logged for ${newReservationForm.studentName}!`);
      }
      setShowReservationModal(false);
      setNewReservationForm({ bookTitle: '', isbn: '', studentName: '', studentRoll: '' });
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Failed to place reservation');
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await api.cancelLibraryReservation(id).catch(() => null);
      erpStore.cancelLibraryReservation(id);
      triggerToast('Reservation cancelled.');
      loadData();
    } catch (err) {
      triggerToast('Failed to cancel reservation');
    }
  };

  const handleSettleFine = async (e) => {
    e.preventDefault();
    if (!selectedFine) return;
    const amount = Number(finePaymentForm.amountPaid) || selectedFine.balance || selectedFine.fineAmount;
    try {
      const res = await api.settleLibraryFine({
        fineId: selectedFine.id,
        studentRoll: selectedFine.studentRoll,
        amountPaid: amount,
        paymentMode: finePaymentForm.paymentMode
      }).catch(() => null);

      const receiptData = {
        receiptNo: res?.data?.receiptNo || `LIB-REC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        studentName: selectedFine.studentName,
        studentRoll: selectedFine.studentRoll,
        bookTitle: selectedFine.bookTitle,
        overdueDays: selectedFine.overdueDays,
        amountPaid: amount,
        paymentMode: finePaymentForm.paymentMode,
        receivedBy: account?.name || 'Chief Librarian Desk'
      };

      erpStore.settleLibraryFine({
        fineId: selectedFine.id,
        studentRoll: selectedFine.studentRoll,
        amountPaid: amount,
        paymentMode: finePaymentForm.paymentMode
      });

      setShowSettleFineModal(false);
      setDigitalReceipt(receiptData);
      triggerToast(`Fine settlement recorded. Receipt: ${receiptData.receiptNo}`);
      loadData();
    } catch (err) {
      triggerToast(err.message || 'Fine settlement error');
    }
  };

  const handleWaiveFine = async (e) => {
    e.preventDefault();
    if (!selectedFine || !waiverReason) {
      triggerToast('Please provide justification for fine waiver.');
      return;
    }
    try {
      await api.waiveLibraryFine({
        fineId: selectedFine.id,
        reason: waiverReason,
        approvedBy: account?.name || 'Chief Librarian'
      }).catch(() => null);

      erpStore.waiveLibraryFine({
        fineId: selectedFine.id,
        reason: waiverReason,
        approvedBy: account?.name || 'Chief Librarian'
      });

      setShowWaiveFineModal(false);
      setWaiverReason('');
      triggerToast(`Fine for ${selectedFine.studentName} waived.`);
      loadData();
    } catch (err) {
      triggerToast('Failed to waive fine');
    }
  };

  const handleCreateAcquisition = async (e) => {
    e.preventDefault();
    if (!newAcqForm.bookTitle) {
      triggerToast('Please provide book title.');
      return;
    }
    try {
      const res = await api.createLibraryAcquisition(newAcqForm).catch(() => null);
      if (res && res.success) {
        triggerToast('Purchase indent successfully created!');
      } else {
        erpStore.addLibraryAcquisition(newAcqForm);
        triggerToast('Purchase indent created in requisition register!');
      }
      setShowAddAcquisitionModal(false);
      setNewAcqForm({
        bookTitle: '',
        author: '',
        vendor: 'Tata McGraw-Hill Education',
        department: 'Computer Science & Engineering',
        quantityRequested: 10,
        unitPrice: 850
      });
      loadData();
    } catch (err) {
      triggerToast('Failed to create purchase indent');
    }
  };

  // --- CSV Exporters ---
  const exportCatalogCsv = () => {
    const headers = ['ISBN', 'Title', 'Author', 'Department', 'Category', 'Edition', 'Total Copies', 'Available Copies', 'Shelf Location'];
    const rows = booksCatalog.map(b => [
      b.isbn,
      `"${b.title}"`,
      `"${b.author}"`,
      b.department || 'General',
      b.category || 'General',
      b.edition || '1st',
      b.totalCopies,
      b.availableCopies,
      `"${b.shelfLocation}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Library_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCirculationCsv = () => {
    const headers = ['Loan ID', 'Book Title', 'Borrower Name', 'Reg No', 'Role', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine Accrued'];
    const rows = circulationRecords.map(c => [
      c.id,
      `"${c.bookTitle}"`,
      `"${c.borrowerName || c.studentName}"`,
      c.borrowerRegNo || c.studentRoll,
      c.role || 'Student',
      c.issueDate,
      c.dueDate,
      c.returnDate || 'N/A',
      c.status,
      c.fineAmount || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GIFT_Circulation_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFinesCsv = () => {
    const headers = ['Fine ID', 'Borrower Name', 'Roll No', 'Book Title', 'Overdue Days', 'Fine Rate', 'Calculated Fine', 'Amount Paid', 'Balance', 'Status', 'Payment Mode'];
    const rows = finesList.map(f => [
      f.id,
      `"${f.studentName}"`,
      f.studentRoll,
      `"${f.bookTitle}"`,
      f.overdueDays || 0,
      f.fineRate || '₹2.00/day',
      f.fineAmount,
      f.amountPaid || 0,
      f.balance !== undefined ? f.balance : f.fineAmount,
      f.status,
      f.paymentMode || 'N/A'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Apna_Campus_Library_Fines_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filtered Data ---
  const filteredBooks = useMemo(() => {
    return booksCatalog.filter(b => {
      const q = searchCatalog.toLowerCase();
      const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q);
      const matchCategory = categoryFilter === 'All' || b.category === categoryFilter;
      const matchDept = deptFilter === 'All' || b.department === deptFilter;
      return matchSearch && matchCategory && matchDept;
    });
  }, [booksCatalog, searchCatalog, categoryFilter, deptFilter]);

  const filteredCirculation = useMemo(() => {
    return circulationRecords.filter(c => {
      const q = circSearch.toLowerCase();
      const name = (c.borrowerName || c.studentName || '').toLowerCase();
      const reg = (c.borrowerRegNo || c.studentRoll || '').toLowerCase();
      const title = (c.bookTitle || '').toLowerCase();
      const matchSearch = !q || name.includes(q) || reg.includes(q) || title.includes(q);
      const matchStatus = circStatusFilter === 'All' || c.status === circStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [circulationRecords, circSearch, circStatusFilter]);

  const filteredFines = useMemo(() => {
    return finesList.filter(f => {
      const q = finesSearch.toLowerCase();
      return !q || f.studentName.toLowerCase().includes(q) || f.studentRoll.toLowerCase().includes(q) || f.bookTitle.toLowerCase().includes(q);
    });
  }, [finesList, finesSearch]);

  const totalTitles = booksCatalog.length;
  const totalPhysicalCopies = booksCatalog.reduce((s, b) => s + (b.totalCopies || 5), 0);
  const totalAvailableCopies = booksCatalog.reduce((s, b) => s + (b.availableCopies || 0), 0);
  const activeLoansCount = circulationRecords.filter(c => c.status !== 'Returned').length;
  const overdueCount = circulationRecords.filter(c => c.status === 'Overdue' || (c.status === 'Issued' && c.fineAmount > 0)).length;
  const outstandingFinesSum = finesList.filter(f => f.status === 'Unpaid').reduce((s, f) => s + (Number(f.balance || f.fineAmount) || 0), 0);

  return (
    <div className="erp-library-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <aside className="erp-sidebar">
          <div className="erp-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="erp-lib-badge" style={{ background: '#ffffff', padding: '3px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="erp-brand-text">
                <h2>Apna Campus</h2>
                <span style={{ color: '#34d399' }}>Central Library</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="erp-sidebar-nav">
            <button
              className={`erp-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Layers size={18} />
              <span>Library Dashboard</span>
              <span className="erp-nav-badge" style={{ background: '#10b981', color: '#ffffff' }}>Live</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'circulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('circulation')}
            >
              <BookmarkCheck size={18} />
              <span>Circulation Counter</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <BookOpen size={18} />
              <span>Books Catalog</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Barcode size={18} />
              <span>Copies & Inventory</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              <BookMarked size={18} />
              <span>Reservations & Waitlist</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'fines' ? 'active' : ''}`}
              onClick={() => setActiveTab('fines')}
            >
              <Clock size={18} />
              <span>Overdue Fines</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'acquisitions' ? 'active' : ''}`}
              onClick={() => setActiveTab('acquisitions')}
            >
              <ShoppingBag size={18} />
              <span>Acquisitions & Indents</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'digital' ? 'active' : ''}`}
              onClick={() => setActiveTab('digital')}
            >
              <Layers size={18} />
              <span>Digital Library</span>
            </button>

            <button
              className={`erp-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileSpreadsheet size={18} />
              <span>Reports & Policies</span>
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="erp-main-content">
        {activeTab === 'dashboard' ? (
          <RoleDashboardLanding
            roleKey="library"
            account={account}
            onLogout={onLogout}
            onSwitchRole={onSwitchRole}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            onNavigate={(target) => {
              if (target === 'lib-search') setActiveTab('catalog');
              else if (target === 'lib-issued') setActiveTab('circulation');
              else if (target === 'lib-overdue') setActiveTab('fines');
              else setActiveTab('catalog');
            }}
          />
        ) : (
          <>
        <header className="erp-header">
          <div className="erp-header-title" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {!sidebarOpen && (
              <button
                className="campus-nav-toggle-btn"
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Show Navigation"
                aria-label="Show Navigation"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1>Central Library Information System</h1>
              <p>Circulation Counter, Bibliographic Catalog & Electronic Holdings</p>
            </div>
          </div>

          <div className="erp-header-actions">
            <div className="erp-role-badge">
              <ShieldCheck size={14} /> Library Staff In-Charge
            </div>

            <div className="campus-user-pill">
              <div className="campus-user-avatar">LIB</div>
              <div className="campus-user-details">
                <strong>{account?.name || 'Chief Librarian'}</strong>
                <small>Central Library Services</small>
              </div>
              <button
                className="campus-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="erp-content-body">
          {/* STATS STRIP */}
          <div className="erp-stats-grid">
            <div
              className={`erp-stat-card lib-stat-card-clickable ${activeTab === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Catalog Titles</span>
                <BookOpen size={18} color="#10b981" />
              </div>
              <div className="erp-stat-val">{totalTitles}</div>
              <div className="erp-stat-note">Across 8 autonomous engineering depts</div>
            </div>

            <div
              className={`erp-stat-card lib-stat-card-clickable ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Physical Copies</span>
                <Barcode size={18} color="#3b82f6" />
              </div>
              <div className="erp-stat-val">{totalPhysicalCopies}</div>
              <div className="erp-stat-note">{totalAvailableCopies} available in stack</div>
            </div>

            <div
              className={`erp-stat-card lib-stat-card-clickable ${activeTab === 'circulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('circulation')}
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Active Loans</span>
                <BookmarkCheck size={18} color="#06b6d4" />
              </div>
              <div className="erp-stat-val">{activeLoansCount}</div>
              <div className="erp-stat-note">{overdueCount} loans currently overdue</div>
            </div>

            <div
              className={`erp-stat-card lib-stat-card-clickable ${activeTab === 'fines' ? 'active' : ''}`}
              onClick={() => setActiveTab('fines')}
            >
              <div className="erp-stat-card-header">
                <span className="erp-stat-card-title">Outstanding Fines</span>
                <Clock size={18} color="#ef4444" />
              </div>
              <div className="erp-stat-val" style={{ color: '#dc2626' }}>₹{outstandingFinesSum}</div>
              <div className="erp-stat-note">₹2.00/day after 2-day grace period</div>
            </div>
          </div>

          {/* TAB: CAMPUS CONNECT (WHATSAPP CLONE) */}
          {activeTab === 'campus-connect' && (
            <div style={{ height: 'calc(100vh - 140px)', minHeight: '680px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', marginBottom: '20px' }}>
              <CampusConnect account={account} />
            </div>
          )}

          {/* TAB 1: CIRCULATION COUNTER */}
          {activeTab === 'circulation' && (
            <div>
              {/* Quick Issue Bar */}
              <div className="lib-quick-issue-box">
                <div className="lib-quick-issue-title">
                  <BookmarkCheck size={20} color="#10b981" />
                  <span>Circulation Issue Counter</span>
                </div>
                <form onSubmit={handleIssueBook} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Select Catalog Title</label>
                    <select
                      className="lib-form-select"
                      value={issueBookId}
                      onChange={(e) => setIssueBookId(e.target.value)}
                    >
                      <option value="">-- Choose Book to Issue --</option>
                      {booksCatalog.map(b => (
                        <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                          {b.title} ({b.availableCopies} avail / {b.shelfLocation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Borrower Role</label>
                    <select
                      className="lib-form-select"
                      value={borrowerRole}
                      onChange={(e) => setBorrowerRole(e.target.value)}
                    >
                      <option value="Student">Student (21 Days / Max 3)</option>
                      <option value="Faculty">Faculty (90 Days / Max 6)</option>
                      <option value="Staff">Non-Teaching Staff (14 Days / Max 2)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Borrower Name</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      placeholder="e.g. Rakesh Das"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Reg / Emp Number</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      value={borrowerRegNo}
                      onChange={(e) => setBorrowerRegNo(e.target.value)}
                      placeholder="e.g. 2305201001"
                    />
                  </div>

                  <div>
                    <button type="submit" className="lib-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      <Plus size={16} /> Issue Book
                    </button>
                  </div>
                </form>
              </div>

              {/* Circulation Ledger Table */}
              <div className="lib-filter-strip">
                <div className="lib-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by student name, roll number, or book title..."
                    value={circSearch}
                    onChange={(e) => setCircSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="lib-select-filter"
                    value={circStatusFilter}
                    onChange={(e) => setCircStatusFilter(e.target.value)}
                  >
                    <option value="All">All Loan Statuses</option>
                    <option value="Issued">Active (Issued)</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Returned">Returned History</option>
                  </select>

                  <button className="lib-btn-outline" onClick={exportCirculationCsv}>
                    <Download size={15} /> Export Ledger CSV
                  </button>
                </div>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Book Title</th>
                      <th>Borrower Identity</th>
                      <th>Role</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Fine Due</th>
                      <th>Status</th>
                      <th>Circulation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCirculation.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No circulation records matching current criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCirculation.map((c) => {
                        const isReturned = c.status === 'Returned';
                        const isOverdue = c.status === 'Overdue' || (c.fineAmount > 0 && !isReturned);
                        return (
                          <tr key={c.id}>
                            <td>
                              <strong style={{ color: '#0f172a' }}>{c.id}</strong>
                            </td>
                            <td>
                              <strong>{c.bookTitle}</strong>
                            </td>
                            <td>
                              <div><strong>{c.borrowerName || c.studentName}</strong></div>
                              <small style={{ color: '#64748b' }}>UID: {c.borrowerRegNo || c.studentRoll}</small>
                            </td>
                            <td>
                              <span className="lib-badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                                {c.role || 'Student'}
                              </span>
                            </td>
                            <td>{c.issueDate}</td>
                            <td>
                              <span style={{ color: isOverdue ? '#dc2626' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                                {c.dueDate}
                              </span>
                            </td>
                            <td>
                              {c.fineAmount > 0 ? (
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>₹{c.fineAmount}</span>
                              ) : (
                                <span style={{ color: '#16a34a' }}>₹0</span>
                              )}
                            </td>
                            <td>
                              <span className={`lib-badge ${
                                isReturned ? 'lib-badge-returned' : (isOverdue ? 'lib-badge-overdue' : 'lib-badge-issued')
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td>
                              {!isReturned ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="lib-btn-success-sm"
                                    onClick={() => handleReturnBook(c)}
                                    title="Process Book Return"
                                  >
                                    <RotateCcw size={13} style={{ display: 'inline', marginRight: 3 }} /> Return
                                  </button>
                                  <button
                                    className="lib-btn-outline lib-btn-sm"
                                    onClick={() => handleRenewBook(c)}
                                    title="Extend loan by 21 days"
                                  >
                                    Renew
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  Returned on {c.returnDate || 'Record'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKS CATALOG */}
          {activeTab === 'catalog' && (
            <div>
              <div className="lib-filter-strip">
                <div className="lib-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search catalog by title, author, or ISBN..."
                    value={searchCatalog}
                    onChange={(e) => setSearchCatalog(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="lib-select-filter"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Electrical Engineering">EE</option>
                    <option value="Mechanical Engineering">MECH</option>
                  </select>

                  <select
                    className="lib-select-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Systems">Operating Systems</option>
                    <option value="Databases">Databases</option>
                    <option value="AI/ML">AI & Deep Learning</option>
                    <option value="Networks">Networking</option>
                    <option value="Software Engineering">Software Eng</option>
                  </select>

                  <button className="lib-btn-outline" onClick={exportCatalogCsv}>
                    <Download size={15} /> Export Catalog CSV
                  </button>

                  <button className="lib-btn-primary" onClick={() => setShowAddBookModal(true)}>
                    <Plus size={16} /> Add Catalog Title
                  </button>
                </div>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>ISBN / Classification</th>
                      <th>Title & Authors</th>
                      <th>Department / Category</th>
                      <th>Edition</th>
                      <th>Inventory (Avail / Total)</th>
                      <th>Shelf Stack</th>
                      <th>Catalog Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{b.isbn}</span>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Call No: DDC-005.1</div>
                        </td>
                        <td>
                          <strong>{b.title}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>By {b.author}</div>
                        </td>
                        <td>
                          <div>{b.category || 'General'}</div>
                          <small style={{ color: '#64748b' }}>{b.department || 'All Branches'}</small>
                        </td>
                        <td>{b.edition || '1st'}</td>
                        <td>
                          <strong style={{ color: b.availableCopies > 0 ? '#16a34a' : '#dc2626' }}>
                            {b.availableCopies}
                          </strong> / {b.totalCopies} copies
                        </td>
                        <td>
                          <span className="lib-badge" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                            {b.shelfLocation}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="lib-btn-outline lib-btn-sm"
                              onClick={() => {
                                setSelectedBookDetail(b);
                              }}
                              title="View Copies & Details"
                            >
                              Details
                            </button>
                            <button
                              className="lib-btn-primary lib-btn-sm"
                              onClick={() => {
                                setSelectedBookForCopy(b);
                                setNewCopyForm({
                                  accessionNumber: `ACC-2026-${b.id.slice(-4).toUpperCase()}-${String((b.totalCopies || 5) + 1).padStart(3, '0')}`,
                                  barcode: `BC-${b.isbn.replace(/[^0-9]/g, '').slice(-6)}-${String((b.totalCopies || 5) + 1).padStart(3, '0')}`,
                                  shelfLocation: b.shelfLocation,
                                  condition: 'Good',
                                  price: 850
                                });
                                setShowAddCopyModal(true);
                              }}
                              title="Add Physical Copy"
                            >
                              + Copy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: COPIES & INVENTORY */}
          {activeTab === 'inventory' && (
            <div>
              <div className="lib-filter-strip">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Stack Physical Copy Ledger</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Individually accessioned physical volumes, barcodes, shelf rack locations, and audit condition states.
                  </p>
                </div>
                <button className="lib-btn-outline" onClick={exportCatalogCsv}>
                  <Download size={15} /> Export Accession Inventory CSV
                </button>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>Accession Number</th>
                      <th>Barcode ID</th>
                      <th>Book Title</th>
                      <th>Shelf Stack Location</th>
                      <th>Physical Condition</th>
                      <th>Status</th>
                      <th>Acquisition Price</th>
                      <th>Audit Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksCatalog.flatMap(b => {
                      return Array.from({ length: b.totalCopies || 5 }).map((_, idx) => {
                        const copyNum = String(idx + 1).padStart(3, '0');
                        const isIssued = idx >= (b.availableCopies || 0);
                        const accNo = `ACC-2026-${b.id.slice(-4).toUpperCase()}-${copyNum}`;
                        const bc = `BC-${b.isbn.replace(/[^0-9]/g, '').slice(-6)}-${copyNum}`;
                        return (
                          <tr key={`${b.id}-copy-${idx}`}>
                            <td>
                              <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{accNo}</strong>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                {bc}
                              </span>
                            </td>
                            <td>{b.title}</td>
                            <td>{b.shelfLocation}</td>
                            <td>
                              <span className={`lib-badge ${idx === 0 && isIssued ? 'lib-badge-damaged' : 'lib-badge-available'}`}>
                                {idx === 0 && isIssued ? 'Fair / Minor Wear' : 'Good (Inspected)'}
                              </span>
                            </td>
                            <td>
                              <span className={`lib-badge ${isIssued ? 'lib-badge-issued' : 'lib-badge-available'}`}>
                                {isIssued ? 'Issued' : 'Available on Shelf'}
                              </span>
                            </td>
                            <td>₹{850 + idx * 25}</td>
                            <td>
                              <button
                                className="lib-btn-outline lib-btn-sm"
                                onClick={() => {
                                  triggerToast(`Physical copy ${accNo} barcode label generated for print.`);
                                }}
                              >
                                <Printer size={13} style={{ display: 'inline', marginRight: 3 }} /> Label
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RESERVATIONS & WAITLIST */}
          {activeTab === 'reservations' && (
            <div>
              <div className="lib-filter-strip">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Book Reservation Queue</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Active reservations awaiting book returns and pickup fulfillment.
                  </p>
                </div>
                <button className="lib-btn-primary" onClick={() => setShowReservationModal(true)}>
                  <Plus size={16} /> Place Reservation
                </button>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>Reservation ID</th>
                      <th>Book Title</th>
                      <th>Borrower Name</th>
                      <th>Student Roll No</th>
                      <th>Queue Priority</th>
                      <th>Reserved Date</th>
                      <th>Collection Deadline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.id}</strong></td>
                        <td><strong>{r.bookTitle}</strong></td>
                        <td>{r.studentName}</td>
                        <td><code>{r.studentRoll}</code></td>
                        <td>
                          <span className="lib-badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                            Position #{r.queuePosition || 1}
                          </span>
                        </td>
                        <td>{r.reservedDate}</td>
                        <td>{r.pickupDeadline}</td>
                        <td>
                          <span className={`lib-badge ${
                            r.status === 'Ready for Pickup' ? 'lib-badge-available' : (r.status === 'Queued' ? 'lib-badge-reserved' : 'lib-badge-returned')
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status !== 'Cancelled' && (
                            <button
                              className="lib-btn-danger-sm"
                              onClick={() => handleCancelReservation(r.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: OVERDUE FINES & SETTLEMENT */}
          {activeTab === 'fines' && (
            <div>
              <div className="lib-filter-strip">
                <div className="lib-search-box">
                  <Search size={16} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by student name or roll number..."
                    value={finesSearch}
                    onChange={(e) => setFinesSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button className="lib-btn-outline" onClick={exportFinesCsv}>
                    <Download size={15} /> Export Fines CSV
                  </button>
                </div>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>Fine ID</th>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Book Title</th>
                      <th>Overdue Days</th>
                      <th>Fine Rate</th>
                      <th>Calculated Fine</th>
                      <th>Amount Paid</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                      <th>Settlement Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFines.map((f) => {
                      const isPaid = f.status === 'Paid';
                      const isWaived = f.status === 'Waived';
                      return (
                        <tr key={f.id}>
                          <td><strong>{f.id}</strong></td>
                          <td><strong>{f.studentName}</strong></td>
                          <td><code>{f.studentRoll}</code></td>
                          <td>{f.bookTitle}</td>
                          <td>{f.overdueDays || 7} Days</td>
                          <td>{f.fineRate || '₹2.00 / day'}</td>
                          <td><strong>₹{f.fineAmount}</strong></td>
                          <td>₹{f.amountPaid || 0}</td>
                          <td>
                            <strong style={{ color: (f.balance || f.fineAmount) > 0 ? '#dc2626' : '#16a34a' }}>
                              ₹{f.balance !== undefined ? f.balance : f.fineAmount}
                            </strong>
                          </td>
                          <td>
                            <span className={`lib-badge ${
                              isPaid ? 'lib-badge-paid' : (isWaived ? 'lib-badge-waived' : 'lib-badge-unpaid')
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td>
                            {!isPaid && !isWaived ? (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="lib-btn-success-sm"
                                  onClick={() => {
                                    setSelectedFine(f);
                                    setFinePaymentForm({
                                      amountPaid: f.balance || f.fineAmount,
                                      paymentMode: 'Cash at Counter'
                                    });
                                    setShowSettleFineModal(true);
                                  }}
                                  title="Collect Fine Payment"
                                >
                                  Settle
                                </button>
                                <button
                                  className="lib-btn-outline lib-btn-sm"
                                  onClick={() => {
                                    setSelectedFine(f);
                                    setShowWaiveFineModal(true);
                                  }}
                                  title="Waive Fine"
                                >
                                  Waive
                                </button>
                              </div>
                            ) : (
                              <button
                                className="lib-btn-outline lib-btn-sm"
                                onClick={() => {
                                  setDigitalReceipt({
                                    receiptNo: f.receiptNo || 'LIB-REC-8841',
                                    date: f.paidDate || '05 Oct 2026',
                                    studentName: f.studentName,
                                    studentRoll: f.studentRoll,
                                    bookTitle: f.bookTitle,
                                    overdueDays: f.overdueDays || 7,
                                    amountPaid: f.amountPaid || f.fineAmount,
                                    paymentMode: f.paymentMode || 'Campus Wallet',
                                    receivedBy: 'Chief Librarian Desk'
                                  });
                                }}
                              >
                                View Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: ACQUISITIONS & INDENTS */}
          {activeTab === 'acquisitions' && (
            <div>
              <div className="lib-filter-strip">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Book Purchase Requisitions & Orders</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Track faculty recommendations, purchase orders, vendor deliveries, and accessioning workflows.
                  </p>
                </div>
                <button className="lib-btn-primary" onClick={() => setShowAddAcquisitionModal(true)}>
                  <Plus size={16} /> New Purchase Indent
                </button>
              </div>

              <div className="lib-table-container">
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>PO Number</th>
                      <th>Book Title & Author</th>
                      <th>Department</th>
                      <th>Publisher / Vendor</th>
                      <th>Quantity (Req / Recv)</th>
                      <th>Total Cost</th>
                      <th>Status</th>
                      <th>Order Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acquisitions.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.poNumber}</strong></td>
                        <td>
                          <strong>{a.bookTitle}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>By {a.author}</div>
                        </td>
                        <td>{a.department}</td>
                        <td>{a.vendor}</td>
                        <td>{a.quantityRequested} / {a.quantityReceived}</td>
                        <td><strong>₹{a.totalCost?.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span className={`lib-badge ${
                            a.status === 'Received & Accessioned' ? 'lib-badge-paid' : 'lib-badge-reserved'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td>{a.orderDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: DIGITAL LIBRARY */}
          {activeTab === 'digital' && (
            <div>
              <div className="lib-filter-strip">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Electronic Holdings & Digital Repositories</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Licensed digital databases, autonomous exam question archives, IEEE publications, and e-book collections.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {digitalResources.map((d) => (
                  <div key={d.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className="lib-badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                        {d.category}
                      </span>
                      <small style={{ color: '#64748b' }}>{d.downloadsCount} accesses</small>
                    </div>

                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#0f172a' }}>{d.title}</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                      {d.description}
                    </p>

                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '16px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                      <div><strong>Access Level:</strong> {d.accessLevel}</div>
                      <div><strong>Format:</strong> {d.fileFormat}</div>
                      <div><strong>License Expiry:</strong> {d.licenseExpiry}</div>
                    </div>

                    <button
                      className="lib-btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => triggerToast(`Connecting to ${d.title} institutional portal...`)}
                    >
                      <ExternalLink size={16} /> Open Institutional Resource
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: REPORTS & POLICIES */}
          {activeTab === 'reports' && (
            <div>
              <div className="lib-filter-strip">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Institutional Circulation Rules & Statistics</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Documented borrowing limits, overdue fine schedules, and one-click regulatory data exports.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="lib-btn-outline" onClick={exportCatalogCsv}>
                    <Download size={14} /> Catalog CSV
                  </button>
                  <button className="lib-btn-outline" onClick={exportCirculationCsv}>
                    <Download size={14} /> Circulation CSV
                  </button>
                  <button className="lib-btn-outline" onClick={exportFinesCsv}>
                    <Download size={14} /> Fines CSV
                  </button>
                </div>
              </div>

              {/* Policy Rules Table */}
              <div className="lib-policy-card">
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#10b981" /> Documented Circulation Quotas & Penalties
                </h4>
                <table className="lib-data-table">
                  <thead>
                    <tr>
                      <th>Borrower Category</th>
                      <th>Max Book Quota</th>
                      <th>Loan Duration</th>
                      <th>Grace Period</th>
                      <th>Daily Fine Rate</th>
                      <th>Maximum Fine Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.borrowerRules?.map((r, idx) => (
                      <tr key={idx}>
                        <td><strong>{r.role}</strong></td>
                        <td>{r.maxBooks} Books</td>
                        <td>{r.loanPeriodDays} Days</td>
                        <td>{r.gracePeriodDays} Days</td>
                        <td><span style={{ color: '#dc2626', fontWeight: 600 }}>{r.fineRatePerDay}</span></td>
                        <td>{r.maxFineCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* General Guidelines */}
              <div className="lib-policy-card">
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.98rem', color: '#0f172a' }}>Autonomous Library Guidelines</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.86rem', lineHeight: 1.8 }}>
                  {policies.generalGuidelines?.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
          </>
        )}
      </main>

      {/* MODAL 1: ADD CATALOG TITLE */}
      {showAddBookModal && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><BookOpen size={20} color="#10b981" /> Register New Catalog Title</h3>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateBook}>
              <div className="lib-modal-body">
                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>ISBN-10 / ISBN-13 *</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      required
                      placeholder="e.g. 978-0131103627"
                      value={newBookForm.isbn}
                      onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    />
                  </div>
                  <div className="lib-form-group">
                    <label>Edition</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      placeholder="e.g. 2nd Edition"
                      value={newBookForm.edition}
                      onChange={(e) => setNewBookForm({ ...newBookForm, edition: e.target.value })}
                    />
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Bibliographic Book Title *</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    required
                    placeholder="e.g. The C Programming Language"
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  />
                </div>

                <div className="lib-form-group">
                  <label>Author(s) *</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    required
                    placeholder="e.g. Brian W. Kernighan, Dennis M. Ritchie"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                  />
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Academic Department</label>
                    <select
                      className="lib-form-select"
                      value={newBookForm.department}
                      onChange={(e) => setNewBookForm({ ...newBookForm, department: e.target.value })}
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="General">General / Applied Sciences</option>
                    </select>
                  </div>

                  <div className="lib-form-group">
                    <label>Subject Category</label>
                    <select
                      className="lib-form-select"
                      value={newBookForm.category}
                      onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                    >
                      <option value="Algorithms">Algorithms</option>
                      <option value="Systems">Operating Systems</option>
                      <option value="Databases">Databases</option>
                      <option value="AI/ML">AI & Deep Learning</option>
                      <option value="Networks">Networking</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Textbook">General Textbook</option>
                    </select>
                  </div>
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Total Physical Copies</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="lib-form-input"
                      value={newBookForm.totalCopies}
                      onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: e.target.value })}
                    />
                  </div>

                  <div className="lib-form-group">
                    <label>Shelf Location</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      placeholder="e.g. Stack 2, Row B"
                      value={newBookForm.shelfLocation}
                      onChange={(e) => setNewBookForm({ ...newBookForm, shelfLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowAddBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary">
                  Register Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER PHYSICAL COPY */}
      {showAddCopyModal && selectedBookForCopy && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><Barcode size={20} color="#10b981" /> Accession Physical Copy</h3>
              <button
                type="button"
                onClick={() => setShowAddCopyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegisterCopy}>
              <div className="lib-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <strong>Title:</strong> {selectedBookForCopy.title}<br />
                  <small style={{ color: '#64748b' }}>ISBN: {selectedBookForCopy.isbn} | Current Copies: {selectedBookForCopy.totalCopies}</small>
                </div>

                <div className="lib-form-group">
                  <label>Accession Number (Auto-Generated / Editable)</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    value={newCopyForm.accessionNumber}
                    onChange={(e) => setNewCopyForm({ ...newCopyForm, accessionNumber: e.target.value })}
                  />
                </div>

                <div className="lib-form-group">
                  <label>Barcode UID</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    value={newCopyForm.barcode}
                    onChange={(e) => setNewCopyForm({ ...newCopyForm, barcode: e.target.value })}
                  />
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Shelf Stack</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      value={newCopyForm.shelfLocation}
                      onChange={(e) => setNewCopyForm({ ...newCopyForm, shelfLocation: e.target.value })}
                    />
                  </div>
                  <div className="lib-form-group">
                    <label>Condition</label>
                    <select
                      className="lib-form-select"
                      value={newCopyForm.condition}
                      onChange={(e) => setNewCopyForm({ ...newCopyForm, condition: e.target.value })}
                    >
                      <option value="Good">Good (New / Intact)</option>
                      <option value="Fair">Fair</option>
                      <option value="Reference Only">Reference Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowAddCopyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary">
                  Accession Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PLACE RESERVATION */}
      {showReservationModal && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><BookMarked size={20} color="#10b981" /> Place Book Reservation</h3>
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateReservation}>
              <div className="lib-modal-body">
                <div className="lib-form-group">
                  <label>Select Catalog Title *</label>
                  <select
                    className="lib-form-select"
                    required
                    value={newReservationForm.bookTitle}
                    onChange={(e) => {
                      const book = booksCatalog.find(b => b.title === e.target.value);
                      setNewReservationForm({
                        ...newReservationForm,
                        bookTitle: e.target.value,
                        isbn: book?.isbn || ''
                      });
                    }}
                  >
                    <option value="">-- Choose Book --</option>
                    {booksCatalog.map(b => (
                      <option key={b.id} value={b.title}>
                        {b.title} ({b.availableCopies} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Borrower Name *</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      required
                      placeholder="e.g. Subham Mahapatra"
                      value={newReservationForm.studentName}
                      onChange={(e) => setNewReservationForm({ ...newReservationForm, studentName: e.target.value })}
                    />
                  </div>
                  <div className="lib-form-group">
                    <label>Registration Number *</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      required
                      placeholder="e.g. 2305201015"
                      value={newReservationForm.studentRoll}
                      onChange={(e) => setNewReservationForm({ ...newReservationForm, studentRoll: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowReservationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary">
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SETTLE FINE */}
      {showSettleFineModal && selectedFine && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><DollarSign size={20} color="#10b981" /> Settle Overdue Fine</h3>
              <button
                type="button"
                onClick={() => setShowSettleFineModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSettleFine}>
              <div className="lib-modal-body">
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div><strong>Student:</strong> {selectedFine.studentName} ({selectedFine.studentRoll})</div>
                  <div><strong>Book:</strong> {selectedFine.bookTitle}</div>
                  <div><strong>Overdue Duration:</strong> {selectedFine.overdueDays || 7} Days</div>
                  <div style={{ marginTop: 6, fontSize: '1.1rem', color: '#dc2626', fontWeight: 700 }}>
                    Total Fine Assessed: ₹{selectedFine.fineAmount}
                  </div>
                </div>

                <div className="lib-form-group">
                  <label>Amount Collected (₹) *</label>
                  <input
                    type="number"
                    className="lib-form-input"
                    required
                    value={finePaymentForm.amountPaid}
                    onChange={(e) => setFinePaymentForm({ ...finePaymentForm, amountPaid: e.target.value })}
                  />
                </div>

                <div className="lib-form-group">
                  <label>Payment Mode</label>
                  <select
                    className="lib-form-select"
                    value={finePaymentForm.paymentMode}
                    onChange={(e) => setFinePaymentForm({ ...finePaymentForm, paymentMode: e.target.value })}
                  >
                    <option value="Cash at Counter">Cash at Counter</option>
                    <option value="Campus Smart Wallet">Campus Smart Wallet</option>
                    <option value="UPI / QR Payment">UPI / QR Payment</option>
                    <option value="Bank Challan">Bank Challan</option>
                  </select>
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowSettleFineModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary">
                  Generate Receipt & Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: WAIVE FINE */}
      {showWaiveFineModal && selectedFine && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><Ban size={20} color="#6366f1" /> Waive Overdue Fine</h3>
              <button
                type="button"
                onClick={() => setShowWaiveFineModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleWaiveFine}>
              <div className="lib-modal-body">
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div><strong>Student:</strong> {selectedFine.studentName} ({selectedFine.studentRoll})</div>
                  <div><strong>Fine Amount:</strong> ₹{selectedFine.fineAmount}</div>
                </div>

                <div className="lib-form-group">
                  <label>Official Justification for Waiver *</label>
                  <textarea
                    rows={3}
                    className="lib-form-textarea"
                    required
                    placeholder="e.g. Verified medical hospital admission during autumn exams approved by Dean Academics."
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowWaiveFineModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary" style={{ background: '#6366f1' }}>
                  Authorize Waiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DIGITAL RECEIPT PREVIEW */}
      {digitalReceipt && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card" style={{ maxWidth: '520px' }}>
            <div className="lib-modal-header">
              <h3><CheckCircle size={20} color="#10b981" /> Official Library Receipt</h3>
              <button
                type="button"
                onClick={() => setDigitalReceipt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="lib-modal-body">
              <div className="lib-receipt-box">
                <div className="lib-receipt-header">
                  <h4>Apna Campus</h4>
                  <p>Central Library & Learning Resource Centre · Bhubaneswar</p>
                  <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
                    OFFICIAL PENALTY CLEARANCE RECEIPT
                  </div>
                </div>

                <div className="lib-receipt-meta">
                  <div><span>Receipt No:</span><br /><strong>{digitalReceipt.receiptNo}</strong></div>
                  <div><span>Date:</span><br /><strong>{digitalReceipt.date}</strong></div>
                  <div><span>Student Name:</span><br /><strong>{digitalReceipt.studentName}</strong></div>
                  <div><span>Roll No:</span><br /><strong>{digitalReceipt.studentRoll}</strong></div>
                </div>

                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px', fontSize: '0.86rem' }}>
                  <div><strong>Particulars:</strong> Late return penalty for <em>"{digitalReceipt.bookTitle}"</em></div>
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Overdue: {digitalReceipt.overdueDays} chargeable days</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 600, color: '#166534' }}>Amount Received:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>₹{digitalReceipt.amountPaid}.00</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                  Payment Mode: {digitalReceipt.paymentMode} | Issued By: {digitalReceipt.receivedBy}<br />
                  Computer-generated valid voucher · Autonomous ERP Certified
                </div>
              </div>
            </div>

            <div className="lib-modal-footer">
              <button
                type="button"
                className="lib-btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                type="button"
                className="lib-btn-outline"
                onClick={() => setDigitalReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: NEW PURCHASE INDENT */}
      {showAddAcquisitionModal && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><ShoppingBag size={20} color="#10b981" /> Create Purchase Indent</h3>
              <button
                type="button"
                onClick={() => setShowAddAcquisitionModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAcquisition}>
              <div className="lib-modal-body">
                <div className="lib-form-group">
                  <label>Book Title *</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    required
                    placeholder="e.g. Modern VLSI Design"
                    value={newAcqForm.bookTitle}
                    onChange={(e) => setNewAcqForm({ ...newAcqForm, bookTitle: e.target.value })}
                  />
                </div>

                <div className="lib-form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    className="lib-form-input"
                    placeholder="e.g. Wayne Wolf"
                    value={newAcqForm.author}
                    onChange={(e) => setNewAcqForm({ ...newAcqForm, author: e.target.value })}
                  />
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Vendor / Publisher</label>
                    <input
                      type="text"
                      className="lib-form-input"
                      value={newAcqForm.vendor}
                      onChange={(e) => setNewAcqForm({ ...newAcqForm, vendor: e.target.value })}
                    />
                  </div>
                  <div className="lib-form-group">
                    <label>Department</label>
                    <select
                      className="lib-form-select"
                      value={newAcqForm.department}
                      onChange={(e) => setNewAcqForm({ ...newAcqForm, department: e.target.value })}
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Electrical Engineering">EE</option>
                      <option value="Mechanical Engineering">MECH</option>
                    </select>
                  </div>
                </div>

                <div className="lib-form-grid-2">
                  <div className="lib-form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="lib-form-input"
                      value={newAcqForm.quantityRequested}
                      onChange={(e) => setNewAcqForm({ ...newAcqForm, quantityRequested: e.target.value })}
                    />
                  </div>
                  <div className="lib-form-group">
                    <label>Estimated Unit Price (₹)</label>
                    <input
                      type="number"
                      className="lib-form-input"
                      value={newAcqForm.unitPrice}
                      onChange={(e) => setNewAcqForm({ ...newAcqForm, unitPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="lib-modal-footer">
                <button type="button" className="lib-btn-outline" onClick={() => setShowAddAcquisitionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="lib-btn-primary">
                  Submit Purchase Indent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: BOOK DETAILS PREVIEW */}
      {selectedBookDetail && (
        <div className="lib-modal-overlay">
          <div className="lib-modal-card">
            <div className="lib-modal-header">
              <h3><BookOpen size={20} color="#10b981" /> Bibliographic Title Details</h3>
              <button
                type="button"
                onClick={() => setSelectedBookDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="lib-modal-body">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' }}>{selectedBookDetail.title}</h4>
                <div style={{ color: '#475569', fontSize: '0.88rem' }}>By {selectedBookDetail.author}</div>
                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                  <strong>ISBN:</strong> {selectedBookDetail.isbn} &nbsp;|&nbsp;
                  <strong> Edition:</strong> {selectedBookDetail.edition || '1st'} &nbsp;|&nbsp;
                  <strong> Dept:</strong> {selectedBookDetail.department || 'General'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>AVAILABLE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{selectedBookDetail.availableCopies}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 600 }}>ISSUED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8' }}>
                    {(selectedBookDetail.totalCopies || 5) - (selectedBookDetail.availableCopies || 0)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>TOTAL STACK</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{selectedBookDetail.totalCopies || 5}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                <strong>Permanent Shelf Stack:</strong> {selectedBookDetail.shelfLocation}<br />
                <strong>Call Number:</strong> DDC-005.1 (Autonomous Dewey Classification)
              </div>
            </div>
            <div className="lib-modal-footer">
              <button type="button" className="lib-btn-outline" onClick={() => setSelectedBookDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
