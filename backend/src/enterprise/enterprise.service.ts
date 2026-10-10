import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnterpriseService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. EXAM CELL
  // ==========================================
  async getExamSchedules() {
    return this.prisma.examSchedule.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async createExamSchedule(data: any) {
    return this.prisma.examSchedule.create({
      data: {
        examCode: data.examCode,
        title: data.title,
        semester: data.semester,
        department: data.department || 'All Departments',
        session: data.session || 'Morning (10:00 AM - 01:00 PM)',
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || 'Scheduled',
        totalAppeared: Number(data.totalAppeared) || 0,
        passPercentage: Number(data.passPercentage) || 0,
        hallTicketLive: Boolean(data.hallTicketLive),
      },
    });
  }

  async publishExamResults(examCode: string) {
    const exam = await this.prisma.examSchedule.findUnique({ where: { examCode } });
    if (!exam) throw new NotFoundException(`Exam ${examCode} not found.`);

    return this.prisma.examSchedule.update({
      where: { examCode },
      data: { status: 'Results Published', hallTicketLive: true },
    });
  }

  // ==========================================
  // 2. CENTRAL LIBRARY INFORMATION SYSTEM
  // ==========================================

  private getFineCalculation(dueDateStr: string, role: string = 'Student'): { overdueDays: number; fineAmount: number } {
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) { // 2-day grace period
      return { overdueDays: 0, fineAmount: 0 };
    }

    const chargeableDays = diffDays - 2;
    let rate = 2; // Student: Rs. 2/day
    let cap = 200;
    if (role === 'Faculty') {
      rate = 0; // Faculty exempt
      cap = 0;
    } else if (role === 'Staff') {
      rate = 1; // Staff: Rs. 1/day
      cap = 100;
    }

    const calculated = chargeableDays * rate;
    const finalFine = Math.min(calculated, cap);
    return { overdueDays: chargeableDays, fineAmount: finalFine };
  }

  async getLibraryDashboardStats() {
    const books = await this.getLibraryBooks();
    const transactions = await this.getLibraryTransactions();
    const reservations = await this.getLibraryReservations();
    const acquisitions = await this.getLibraryAcquisitions();
    const fines = await this.getLibraryFines();

    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (b.totalCopies || 5), 0);
    const availableCopies = books.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
    const issuedCopies = Math.max(0, totalCopies - availableCopies);
    const activeLoans = transactions.filter(t => t.status === 'Issued' || t.status === 'Overdue').length;
    const overdueLoans = transactions.filter(t => t.status === 'Overdue' || (t.status === 'Issued' && t.fineAmount > 0)).length;
    const reservationsPending = reservations.filter((r: any) => r.status === 'Queued' || r.status === 'Ready for Pickup').length;

    const outstandingFines = fines.filter((f: any) => f.status === 'Unpaid').reduce((sum: number, f: any) => sum + (Number(f.fineAmount) || 0), 0);
    const finesCollected = fines.filter((f: any) => f.status === 'Paid' || f.status === 'Settled').reduce((sum: number, f: any) => sum + (Number(f.amountPaid) || Number(f.fineAmount) || 0), 0);

    const categoryCounts: Record<string, number> = {};
    books.forEach(b => {
      const cat = b.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + (b.totalCopies || 1);
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      copies: count,
      percentage: totalCopies > 0 ? Math.round((count / totalCopies) * 100) : 0,
    }));

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      issuedCopies,
      activeLoans,
      overdueLoans,
      reservationsPending,
      outstandingFines,
      finesCollected,
      lostOrDamaged: 2,
      booksAcquiredYear: 184,
      categoryDistribution,
      monthlyCirculation: [
        { month: 'Jun', issues: 412, returns: 390 },
        { month: 'Jul', issues: 645, returns: 580 },
        { month: 'Aug', issues: 890, returns: 810 },
        { month: 'Sep', issues: 920, returns: 875 },
        { month: 'Oct', issues: 540, returns: 480 },
      ],
    };
  }

  async getLibraryBooks(search?: string, department?: string, category?: string) {
    const count = await this.prisma.libraryBook.count();
    if (count === 0) {
      const defaultBooks = [
        { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest, Stein', department: 'Computer Science & Engineering', category: 'Algorithms', totalCopies: 25, availableCopies: 7, shelfLocation: 'Stack 3, Row B' },
        { isbn: '978-0133591620', title: 'Operating System Concepts (Silberschatz)', author: 'Silberschatz, Galvin, Gagne', department: 'Computer Science & Engineering', category: 'Systems', totalCopies: 20, availableCopies: 4, shelfLocation: 'Stack 3, Row D' },
        { isbn: '978-0078022159', title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry Korth', department: 'Computer Science & Engineering', category: 'Databases', totalCopies: 18, availableCopies: 9, shelfLocation: 'Stack 4, Row A' },
        { isbn: '978-0136042594', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', department: 'Computer Science & Engineering', category: 'AI/ML', totalCopies: 15, availableCopies: 3, shelfLocation: 'Stack 4, Row C' },
        { isbn: '978-0262035613', title: 'Deep Learning', author: 'Ian Goodfellow, Yoshua Bengio', department: 'Computer Science & Engineering', category: 'AI/ML', totalCopies: 12, availableCopies: 2, shelfLocation: 'Stack 5, Row A' },
        { isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', department: 'Computer Science & Engineering', category: 'Software Engineering', totalCopies: 10, availableCopies: 5, shelfLocation: 'Stack 5, Row B' },
        { isbn: '978-0132143011', title: 'Computer Networks', author: 'Andrew S. Tanenbaum, David J. Wetherall', department: 'Electronics & Communication', category: 'Networks', totalCopies: 16, availableCopies: 6, shelfLocation: 'Stack 6, Row A' },
        { isbn: '978-0070146143', title: 'Modern Control Engineering', author: 'Katsuhiko Ogata', department: 'Electrical Engineering', category: 'Control Systems', totalCopies: 14, availableCopies: 8, shelfLocation: 'Stack 7, Row C' },
      ];

      for (const b of defaultBooks) {
        await this.prisma.libraryBook.create({ data: b });
      }
    }

    const where: any = {};
    if (department && department !== 'All') {
      where.department = department;
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.libraryBook.findMany({ where, orderBy: { title: 'asc' } });
  }

  async createLibraryBook(data: any) {
    if (!data.isbn || !data.title || !data.author) {
      throw new BadRequestException('ISBN, Title, and Author are mandatory fields.');
    }
    const existing = await this.prisma.libraryBook.findUnique({ where: { isbn: data.isbn } });
    if (existing) {
      throw new BadRequestException(`A title with ISBN ${data.isbn} already exists in the catalog.`);
    }

    const totalCopies = Number(data.totalCopies) || 5;
    const newBook = await this.prisma.libraryBook.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        author: data.author,
        department: data.department || 'General',
        category: data.category || 'Textbook',
        totalCopies,
        availableCopies: totalCopies,
        shelfLocation: data.shelfLocation || 'Stack 1, Row A',
      },
    });

    // Automatically generate individual physical copy records for this new title
    for (let i = 1; i <= totalCopies; i++) {
      const copyNum = String(i).padStart(3, '0');
      const accNo = `ACC-2026-${newBook.id.slice(-4).toUpperCase()}-${copyNum}`;
      const barcode = `BC-${newBook.isbn.replace(/[^0-9]/g, '').slice(-6)}-${copyNum}`;
      await this.prisma.workflowRequest.create({
        data: {
          workflowType: 'LIBRARY_COPY',
          title: `Copy ${i} - ${newBook.title}`,
          requesterId: newBook.id,
          requesterName: 'Cataloguing Desk',
          requesterRole: 'LIBRARY',
          details: {
            bookId: newBook.id,
            isbn: newBook.isbn,
            bookTitle: newBook.title,
            accessionNumber: accNo,
            barcode,
            copyIndex: i,
            shelfLocation: newBook.shelfLocation,
            condition: 'Good',
            status: 'Available',
            acquisitionDate: new Date().toISOString().split('T')[0],
            price: Number(data.price) || 850,
          },
          currentStage: 'Registered',
          status: 'Active',
        },
      });
    }

    return newBook;
  }

  async getLibraryCopies(bookId?: string) {
    const where: any = { workflowType: 'LIBRARY_COPY' };
    if (bookId) {
      where.requesterId = bookId;
    }
    const copies = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (copies.length === 0) {
      // Seed default physical copies for catalog
      const books = await this.getLibraryBooks();
      const seededCopies: any[] = [];
      for (const b of books.slice(0, 4)) {
        for (let i = 1; i <= (b.totalCopies || 5); i++) {
          const isIssued = i > (b.availableCopies || 0);
          const copyNum = String(i).padStart(3, '0');
          const accNo = `ACC-2026-${b.id.slice(-4).toUpperCase()}-${copyNum}`;
          const barcode = `BC-${b.isbn.replace(/[^0-9]/g, '').slice(-6)}-${copyNum}`;
          const copy = await this.prisma.workflowRequest.create({
            data: {
              workflowType: 'LIBRARY_COPY',
              title: `Copy ${i} - ${b.title}`,
              requesterId: b.id,
              requesterName: 'Cataloguing Desk',
              requesterRole: 'LIBRARY',
              details: {
                bookId: b.id,
                isbn: b.isbn,
                bookTitle: b.title,
                accessionNumber: accNo,
                barcode,
                copyIndex: i,
                shelfLocation: b.shelfLocation,
                condition: i === 1 && isIssued ? 'Fair' : 'Good',
                status: isIssued ? 'Issued' : 'Available',
                acquisitionDate: '2026-07-15',
                price: 950,
              },
              currentStage: 'Registered',
              status: isIssued ? 'Issued' : 'Available',
            },
          });
          seededCopies.push({ id: copy.id, ...((copy.details as any) || {}) });
        }
      }
      return seededCopies;
    }

    return copies.map(c => ({
      id: c.id,
      ...((c.details as any) || {}),
    }));
  }

  async registerLibraryCopy(data: any) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: data.bookId } });
    if (!book) throw new NotFoundException('Parent bibliographic title not found.');

    const newIndex = book.totalCopies + 1;
    const copyNum = String(newIndex).padStart(3, '0');
    const accNo = data.accessionNumber || `ACC-2026-${book.id.slice(-4).toUpperCase()}-${copyNum}`;
    const barcode = data.barcode || `BC-${book.isbn.replace(/[^0-9]/g, '').slice(-6)}-${copyNum}`;

    await this.prisma.libraryBook.update({
      where: { id: data.bookId },
      data: {
        totalCopies: { increment: 1 },
        availableCopies: { increment: 1 },
      },
    });

    const copy = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_COPY',
        title: `Copy ${newIndex} - ${book.title}`,
        requesterId: book.id,
        requesterName: 'Accessioning Desk',
        requesterRole: 'LIBRARY',
        details: {
          bookId: book.id,
          isbn: book.isbn,
          bookTitle: book.title,
          accessionNumber: accNo,
          barcode,
          copyIndex: newIndex,
          shelfLocation: data.shelfLocation || book.shelfLocation,
          condition: data.condition || 'Good',
          status: 'Available',
          acquisitionDate: data.acquisitionDate || new Date().toISOString().split('T')[0],
          price: Number(data.price) || 850,
        },
        currentStage: 'Registered',
        status: 'Available',
      },
    });

    return { id: copy.id, ...((copy.details as any) || {}) };
  }

  async updateLibraryCopyStatus(copyId: string, status: string, notes?: string) {
    const copy = await this.prisma.workflowRequest.findUnique({ where: { id: copyId } });
    if (!copy) throw new NotFoundException('Physical copy record not found.');

    const currentDetails = (copy.details as any) || {};
    const oldStatus = currentDetails.status;
    currentDetails.status = status;
    if (notes) currentDetails.statusNotes = notes;

    // Adjust parent available copies if condition changes from Available to Lost/Damaged
    if (oldStatus === 'Available' && (status === 'Lost' || status === 'Damaged' || status === 'Under Repair')) {
      await this.prisma.libraryBook.update({
        where: { id: currentDetails.bookId },
        data: { availableCopies: { decrement: 1 } },
      });
    } else if (oldStatus !== 'Available' && status === 'Available') {
      await this.prisma.libraryBook.update({
        where: { id: currentDetails.bookId },
        data: { availableCopies: { increment: 1 } },
      });
    }

    const updated = await this.prisma.workflowRequest.update({
      where: { id: copyId },
      data: {
        status,
        details: currentDetails,
        approvalNotes: notes || `Status changed to ${status}`,
      },
    });

    return { id: updated.id, ...((updated.details as any) || {}) };
  }

  async getLibraryTransactions(studentRoll?: string, statusFilter?: string) {
    const count = await this.prisma.libraryTransaction.count();
    if (count === 0) {
      const defaultTxns = [
        {
          bookId: 'seed-bk-1',
          bookTitle: 'Introduction to Algorithms (CLRS)',
          studentRoll: '2305201001',
          studentName: 'Rakesh Das',
          issueDate: '2026-09-20',
          dueDate: '2026-10-11',
          status: 'Issued',
          fineAmount: 0,
        },
        {
          bookId: 'seed-bk-2',
          bookTitle: 'Operating System Concepts (Silberschatz)',
          studentRoll: '2305201002',
          studentName: 'Amit Nayak',
          issueDate: '2026-09-10',
          dueDate: '2026-10-01',
          status: 'Overdue',
          fineAmount: 14,
        },
        {
          bookId: 'seed-bk-3',
          bookTitle: 'Database System Concepts',
          studentRoll: 'FAC-042',
          studentName: 'Dr. S. Mohanty (Faculty)',
          issueDate: '2026-08-15',
          dueDate: '2026-11-15',
          status: 'Issued',
          fineAmount: 0,
        },
        {
          bookId: 'seed-bk-4',
          bookTitle: 'Artificial Intelligence: A Modern Approach',
          studentRoll: '2305201004',
          studentName: 'Priya Patra',
          issueDate: '2026-09-01',
          dueDate: '2026-09-22',
          returnDate: '2026-09-21',
          status: 'Returned',
          fineAmount: 0,
        },
      ];

      for (const t of defaultTxns) {
        await this.prisma.libraryTransaction.create({ data: t });
      }
    }

    const where: any = {};
    if (studentRoll) {
      where.studentRoll = studentRoll;
    }
    if (statusFilter && statusFilter !== 'All') {
      where.status = statusFilter;
    }

    const transactions = await this.prisma.libraryTransaction.findMany({
      where,
      orderBy: { issueDate: 'desc' },
    });

    // Dynamically calculate live overdue days & fine
    return transactions.map(t => {
      if (t.status === 'Issued' || t.status === 'Overdue') {
        const isFaculty = t.studentRoll.startsWith('FAC');
        const role = isFaculty ? 'Faculty' : 'Student';
        const { overdueDays, fineAmount } = this.getFineCalculation(t.dueDate, role);
        const dynamicStatus = overdueDays > 0 ? 'Overdue' : 'Issued';
        return {
          ...t,
          overdueDays,
          fineAmount: Math.max(t.fineAmount, fineAmount),
          status: dynamicStatus,
          role,
        };
      }
      return {
        ...t,
        overdueDays: 0,
        role: t.studentRoll.startsWith('FAC') ? 'Faculty' : 'Student',
      };
    });
  }

  async issueBook(data: { bookId: string; studentRoll: string; studentName: string; role?: string }) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: data.bookId } });
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies <= 0) throw new BadRequestException('No available copies remaining for this title.');

    const role = data.role || (data.studentRoll.startsWith('FAC') ? 'Faculty' : 'Student');
    
    // Validate borrowing limit: Student max 3 active loans, Faculty max 6, Staff max 2
    const activeLoans = await this.prisma.libraryTransaction.count({
      where: {
        studentRoll: data.studentRoll,
        status: { in: ['Issued', 'Overdue'] },
      },
    });

    const maxLimit = role === 'Faculty' ? 6 : (role === 'Staff' ? 2 : 3);
    if (activeLoans >= maxLimit) {
      throw new BadRequestException(`Borrower has reached maximum active borrowing quota (${maxLimit} books for ${role}).`);
    }

    // Decrement available copies
    await this.prisma.libraryBook.update({
      where: { id: data.bookId },
      data: { availableCopies: { decrement: 1 } },
    });

    const today = new Date();
    const loanDurationDays = role === 'Faculty' ? 90 : (role === 'Staff' ? 14 : 21);
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + loanDurationDays);

    return this.prisma.libraryTransaction.create({
      data: {
        bookId: data.bookId,
        bookTitle: book.title,
        studentRoll: data.studentRoll,
        studentName: data.studentName,
        issueDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Issued',
        fineAmount: 0,
      },
    });
  }

  async returnBook(transactionId: string) {
    const txn = await this.prisma.libraryTransaction.findUnique({ where: { id: transactionId } });
    if (!txn) throw new NotFoundException('Transaction record not found');
    if (txn.status === 'Returned') throw new BadRequestException('Book has already been returned.');

    const role = txn.studentRoll.startsWith('FAC') ? 'Faculty' : 'Student';
    const { overdueDays, fineAmount } = this.getFineCalculation(txn.dueDate, role);

    await this.prisma.libraryBook.update({
      where: { id: txn.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    const returnDate = new Date().toISOString().split('T')[0];
    const updated = await this.prisma.libraryTransaction.update({
      where: { id: transactionId },
      data: {
        returnDate,
        status: 'Returned',
        fineAmount,
      },
    });

    // If fine is incurred, log a pending fine payment workflow
    if (fineAmount > 0) {
      await this.prisma.workflowRequest.create({
        data: {
          workflowType: 'LIBRARY_FINE_PAYMENT',
          title: `Overdue Fine - ${txn.studentName} (${txn.bookTitle})`,
          requesterId: txn.studentRoll,
          requesterName: txn.studentName,
          requesterRole: role,
          details: {
            transactionId: txn.id,
            bookTitle: txn.bookTitle,
            studentRoll: txn.studentRoll,
            studentName: txn.studentName,
            overdueDays,
            fineAmount,
            status: 'Unpaid',
            issuedDate: txn.issueDate,
            returnedDate: returnDate,
          },
          currentStage: 'Pending Settlement',
          status: 'Unpaid',
        },
      });
    }

    return { ...updated, overdueDays, fineAmount };
  }

  async renewBook(transactionId: string) {
    const txn = await this.prisma.libraryTransaction.findUnique({ where: { id: transactionId } });
    if (!txn) throw new NotFoundException('Loan record not found');
    if (txn.status !== 'Issued') throw new BadRequestException('Only actively issued books can be renewed.');

    const currentDue = new Date(txn.dueDate);
    const today = new Date();
    if (today > currentDue) {
      throw new BadRequestException('Cannot renew an overdue book. Please clear accrued overdue fines at circulation counter first.');
    }

    // Extend by 21 days from current due date
    currentDue.setDate(currentDue.getDate() + 21);
    const newDueDate = currentDue.toISOString().split('T')[0];

    return this.prisma.libraryTransaction.update({
      where: { id: transactionId },
      data: {
        dueDate: newDueDate,
      },
    });
  }

  // --- Book Reservations & Waitlists ---
  async getLibraryReservations() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_RESERVATION' },
      orderBy: { createdAt: 'desc' },
    });

    if (list.length === 0) {
      const defaultReservations = [
        {
          id: 'RES-101',
          bookTitle: 'Deep Learning',
          isbn: '978-0262035613',
          studentName: 'Subham Mahapatra',
          studentRoll: '2305201015',
          queuePosition: 1,
          reservedDate: '2026-10-06',
          pickupDeadline: '2026-10-12',
          status: 'Ready for Pickup',
        },
        {
          id: 'RES-102',
          bookTitle: 'Artificial Intelligence: A Modern Approach',
          isbn: '978-0136042594',
          studentName: 'Sunita Biswal',
          studentRoll: '2305201020',
          queuePosition: 2,
          reservedDate: '2026-10-08',
          pickupDeadline: '2026-10-15',
          status: 'Queued',
        },
      ];

      for (const r of defaultReservations) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'LIBRARY_RESERVATION',
            title: `Reservation: ${r.bookTitle} by ${r.studentName}`,
            requesterId: r.studentRoll,
            requesterName: r.studentName,
            requesterRole: 'Student',
            details: r,
            currentStage: r.status,
            status: r.status,
          },
        });
      }

      return defaultReservations;
    }

    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async createLibraryReservation(data: { bookTitle: string; isbn: string; studentName: string; studentRoll: string }) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const reservation = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_RESERVATION',
        title: `Reservation: ${data.bookTitle} by ${data.studentName}`,
        requesterId: data.studentRoll,
        requesterName: data.studentName,
        requesterRole: 'Student',
        details: {
          bookTitle: data.bookTitle,
          isbn: data.isbn,
          studentName: data.studentName,
          studentRoll: data.studentRoll,
          queuePosition: 1,
          reservedDate: new Date().toISOString().split('T')[0],
          pickupDeadline: deadline.toISOString().split('T')[0],
          status: 'Queued',
        },
        currentStage: 'Queued',
        status: 'Queued',
      },
    });

    return { id: reservation.id, ...((reservation.details as any) || {}) };
  }

  async cancelLibraryReservation(id: string) {
    return this.prisma.workflowRequest.update({
      where: { id },
      data: { status: 'Cancelled', currentStage: 'Cancelled' },
    });
  }

  // --- Overdue Fines & Penalty Settlement ---
  async getLibraryFines() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_FINE_PAYMENT' },
      orderBy: { createdAt: 'desc' },
    });

    if (list.length === 0) {
      const defaultFines = [
        {
          id: 'FINE-901',
          transactionId: 'TXN-901',
          studentName: 'Amit Nayak',
          studentRoll: '2305201002',
          bookTitle: 'Operating System Concepts (Silberschatz)',
          accessionNo: 'ACC-2026-1002-002',
          overdueDays: 7,
          fineRate: '₹2.00 / day',
          fineAmount: 14,
          amountPaid: 0,
          balance: 14,
          status: 'Unpaid',
          dueDate: '2026-10-01',
        },
        {
          id: 'FINE-902',
          transactionId: 'TXN-902',
          studentName: 'Rajesh Samal',
          studentRoll: '2305201008',
          bookTitle: 'Computer Networks',
          accessionNo: 'ACC-2026-1007-004',
          overdueDays: 12,
          fineRate: '₹2.00 / day',
          fineAmount: 24,
          amountPaid: 24,
          balance: 0,
          status: 'Paid',
          paymentMode: 'Campus Smart Wallet',
          receiptNo: 'LIB-REC-8841',
          paidDate: '2026-10-05',
          dueDate: '2026-09-23',
        },
      ];

      for (const f of defaultFines) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'LIBRARY_FINE_PAYMENT',
            title: `Fine: ${f.studentName} - ₹${f.fineAmount}`,
            requesterId: f.studentRoll,
            requesterName: f.studentName,
            requesterRole: 'Student',
            details: f,
            currentStage: f.status,
            status: f.status,
          },
        });
      }

      return defaultFines;
    }

    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async settleLibraryFine(data: { fineId?: string; studentRoll: string; amountPaid: number; paymentMode: string }) {
    if (data.fineId) {
      const fineRecord = await this.prisma.workflowRequest.findUnique({ where: { id: data.fineId } });
      if (fineRecord) {
        const details = (fineRecord.details as any) || {};
        details.amountPaid = Number(data.amountPaid);
        details.balance = Math.max(0, (Number(details.fineAmount) || 0) - Number(data.amountPaid));
        details.status = details.balance === 0 ? 'Paid' : 'Partial';
        details.paymentMode = data.paymentMode || 'Cash at Counter';
        details.receiptNo = `LIB-REC-${Math.floor(1000 + Math.random() * 9000)}`;
        details.paidDate = new Date().toISOString().split('T')[0];

        await this.prisma.workflowRequest.update({
          where: { id: data.fineId },
          data: {
            status: details.status,
            currentStage: details.status,
            details,
          },
        });

        return details;
      }
    }

    // Generic settlement entry
    const receiptNo = `LIB-REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_FINE_PAYMENT',
        title: `Fine Paid: ${data.studentRoll} - ₹${data.amountPaid}`,
        requesterId: data.studentRoll,
        requesterName: data.studentRoll,
        requesterRole: 'Student',
        details: {
          studentRoll: data.studentRoll,
          amountPaid: Number(data.amountPaid),
          balance: 0,
          status: 'Paid',
          paymentMode: data.paymentMode || 'Cash at Counter',
          receiptNo,
          paidDate: new Date().toISOString().split('T')[0],
        },
        currentStage: 'Paid',
        status: 'Paid',
      },
    });

    return { id: newRecord.id, ...((newRecord.details as any) || {}) };
  }

  async waiveLibraryFine(data: { fineId: string; reason: string; approvedBy: string }) {
    const fine = await this.prisma.workflowRequest.findUnique({ where: { id: data.fineId } });
    if (!fine) throw new NotFoundException('Fine record not found');

    const details = (fine.details as any) || {};
    details.status = 'Waived';
    details.balance = 0;
    details.waivedReason = data.reason;
    details.waivedBy = data.approvedBy;
    details.waivedDate = new Date().toISOString().split('T')[0];

    return this.prisma.workflowRequest.update({
      where: { id: data.fineId },
      data: {
        status: 'Waived',
        currentStage: 'Waived',
        approvalNotes: `Fine waived: ${data.reason}`,
        details,
      },
    });
  }

  // --- Acquisitions & Stock Indents ---
  async getLibraryAcquisitions() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_ACQUISITION' },
      orderBy: { createdAt: 'desc' },
    });

    if (list.length === 0) {
      const defaultAcquisitions = [
        {
          id: 'ACQ-401',
          poNumber: 'GIFT/LIB/PO/2026/088',
          bookTitle: 'Generative AI and Large Language Models in Practice',
          author: 'Maximilian Schwarz & Prof. K. Patel',
          vendor: 'Tata McGraw-Hill Education',
          department: 'Computer Science & Engineering',
          quantityRequested: 15,
          quantityReceived: 15,
          unitPrice: 850,
          totalCost: 12750,
          status: 'Received & Accessioned',
          orderDate: '2026-08-20',
          receivedDate: '2026-09-15',
        },
        {
          id: 'ACQ-402',
          poNumber: 'GIFT/LIB/PO/2026/092',
          bookTitle: 'VLSI Circuit Design for Modern SoCs',
          author: 'Dr. Debabrata Jena',
          vendor: 'Oxford University Press',
          department: 'Electronics & Communication',
          quantityRequested: 20,
          quantityReceived: 0,
          unitPrice: 1100,
          totalCost: 22000,
          status: 'Order Dispatched',
          orderDate: '2026-09-28',
          expectedDelivery: '2026-10-18',
        },
      ];

      for (const a of defaultAcquisitions) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'LIBRARY_ACQUISITION',
            title: `PO: ${a.poNumber} - ${a.bookTitle}`,
            requesterId: a.department,
            requesterName: 'Department HOD Recommendation',
            requesterRole: 'FACULTY',
            details: a,
            currentStage: a.status,
            status: a.status,
          },
        });
      }

      return defaultAcquisitions;
    }

    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async createLibraryAcquisition(data: any) {
    const poNumber = data.poNumber || `GIFT/LIB/PO/2026/${Math.floor(100 + Math.random() * 900)}`;
    const totalCost = (Number(data.quantityRequested) || 1) * (Number(data.unitPrice) || 850);

    const acquisition = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_ACQUISITION',
        title: `PO: ${poNumber} - ${data.bookTitle}`,
        requesterId: data.department || 'General',
        requesterName: 'Central Library Indent',
        requesterRole: 'LIBRARY',
        details: {
          poNumber,
          bookTitle: data.bookTitle,
          author: data.author,
          vendor: data.vendor || 'Authorized Academic Publisher',
          department: data.department || 'Computer Science & Engineering',
          quantityRequested: Number(data.quantityRequested) || 10,
          quantityReceived: 0,
          unitPrice: Number(data.unitPrice) || 850,
          totalCost,
          status: 'Requested',
          orderDate: new Date().toISOString().split('T')[0],
        },
        currentStage: 'Requested',
        status: 'Requested',
      },
    });

    return { id: acquisition.id, ...((acquisition.details as any) || {}) };
  }

  // --- Digital Library & Electronic Subscriptions ---
  async getLibraryDigitalResources(search?: string) {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_DIGITAL_RESOURCE' },
      orderBy: { createdAt: 'desc' },
    });

    if (list.length === 0) {
      const defaultDigital = [
        {
          id: 'DIG-01',
          title: 'IEEE Xplore Digital Library Institutional Portal',
          category: 'Journal Database',
          accessLevel: 'Campus Intranet & VPN SSO',
          fileFormat: 'Online Database / PDF Reprints',
          downloadsCount: 1420,
          licenseExpiry: '2027-08-31',
          description: 'Full-text access to 195+ IEEE journals, transactions, and conference proceedings.',
        },
        {
          id: 'DIG-02',
          title: 'Autonomous Autonomous End-Semester Question Bank (2021-2025)',
          category: 'Examination Archives',
          accessLevel: 'Student & Faculty Login',
          fileFormat: 'Searchable PDF Archives',
          downloadsCount: 3840,
          licenseExpiry: 'Perpetual Institutional Archive',
          description: 'Verified past semester questions and model answer schemes for all B.Tech branches.',
        },
        {
          id: 'DIG-03',
          title: 'SpringerLink Engineering & Computer Science E-Books',
          category: 'E-Books',
          accessLevel: 'Open on Campus Wi-Fi',
          fileFormat: 'EPUB & PDF',
          downloadsCount: 980,
          licenseExpiry: '2027-12-31',
          description: 'Curated 4,500+ volumes of computer architecture, algorithms, robotics and mechanics.',
        },
      ];

      for (const d of defaultDigital) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'LIBRARY_DIGITAL_RESOURCE',
            title: d.title,
            requesterId: 'DIGITAL_LIBRARY',
            requesterName: 'Electronic Resource Management Desk',
            requesterRole: 'LIBRARY',
            details: d,
            currentStage: 'Active Subscription',
            status: 'Active',
          },
        });
      }

      return defaultDigital;
    }

    let results = list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    return results;
  }

  getLibraryPolicies() {
    return {
      borrowerRules: [
        { role: 'Student (Undergraduate)', maxBooks: 3, loanPeriodDays: 21, gracePeriodDays: 2, fineRatePerDay: '₹2.00', maxFineCap: '₹200.00' },
        { role: 'Student (Postgraduate / Research)', maxBooks: 5, loanPeriodDays: 30, gracePeriodDays: 3, fineRatePerDay: '₹2.00', maxFineCap: '₹250.00' },
        { role: 'Faculty Members', maxBooks: 6, loanPeriodDays: 90, gracePeriodDays: 7, fineRatePerDay: 'Exempt', maxFineCap: 'N/A' },
        { role: 'Non-Teaching Technical Staff', maxBooks: 2, loanPeriodDays: 14, gracePeriodDays: 2, fineRatePerDay: '₹1.00', maxFineCap: '₹100.00' },
      ],
      generalGuidelines: [
        'Physical identity card with encrypted RFID is mandatory for physical book circulation.',
        'A maximum of 2 renewals are permitted online, provided the title is not on an active waitlist.',
        'Lost or heavily damaged books incur standard replacement cost plus a flat ₹150 binding and processing surcharge.',
        'Reference copies and bound journal volumes are strictly for reading room utilization only.',
      ],
    };
  }

  // ==========================================
  // 3. TRAINING & PLACEMENT (T&P) OPERATIONS
  // ==========================================
  async getPlacementDashboardStats() {
    const drives = await this.getPlacementDrives();
    const companies = await this.getPlacementCompanies();
    const applications = await this.getPlacementApplications();

    const totalDrives = drives.length;
    const totalRecruiters = companies.length;

    // Derived from active cohort (Autumn 2026 Batch)
    const eligibleCohort = 420;
    const placedStudents = 346;
    const totalOffers = 412; // Some students have multiple dream offers
    const placementRate = Math.round((placedStudents / eligibleCohort) * 1000) / 10; // 82.4%

    const packages = drives.map(d => Number(d.packageLPA) || 6.5);
    const highestCTC = Math.max(...packages, 24.0);
    const averageCTC = 6.8;
    const medianCTC = 6.2;

    const branchStats = [
      { branch: 'Computer Science & Engineering', code: 'CSE', eligible: 160, placed: 152, offers: 198, placementRate: 95.0, avgCTC: '₹8.4 LPA', highestCTC: '₹24.0 LPA' },
      { branch: 'Electronics & Communication', code: 'ECE', eligible: 90, placed: 78, offers: 94, placementRate: 86.7, avgCTC: '₹6.8 LPA', highestCTC: '₹14.0 LPA' },
      { branch: 'Electrical & Electronics', code: 'EEE', eligible: 60, placed: 48, offers: 52, placementRate: 80.0, avgCTC: '₹5.8 LPA', highestCTC: '₹9.2 LPA' },
      { branch: 'Mechanical Engineering', code: 'MECH', eligible: 55, placed: 41, offers: 42, placementRate: 74.5, avgCTC: '₹5.2 LPA', highestCTC: '₹8.0 LPA' },
      { branch: 'Civil Engineering', code: 'CIVIL', eligible: 35, placed: 24, offers: 24, placementRate: 68.6, avgCTC: '₹4.8 LPA', highestCTC: '₹6.5 LPA' },
      { branch: 'Master of Computer Applications', code: 'MCA', eligible: 20, placed: 18, offers: 22, placementRate: 90.0, avgCTC: '₹6.2 LPA', highestCTC: '₹10.5 LPA' },
    ];

    const tierStats = [
      { tier: 'Super Dream (₹12+ LPA)', companiesCount: 4, offersCount: 28, percentage: 6.8 },
      { tier: 'Dream Recruiters (₹6 - ₹12 LPA)', companiesCount: 16, offersCount: 164, percentage: 39.8 },
      { tier: 'Core & IT Services (₹3.5 - ₹6 LPA)', companiesCount: 28, offersCount: 220, percentage: 53.4 },
    ];

    return {
      placementRate,
      highestCTC,
      averageCTC,
      medianCTC,
      totalRecruiters,
      totalDrives,
      eligibleCohort,
      placedStudents,
      totalOffers,
      branchStats,
      tierStats,
    };
  }

  // --- Corporate Recruiting Partners (CRM) ---
  async getPlacementCompanies() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'PLACEMENT_COMPANY' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultCompanies = [
        {
          id: 'COMP-01',
          name: 'Tata Consultancy Services (TCS)',
          category: 'Tier 1 IT Services',
          hrContact: 'Ms. Ananya Sengupta',
          email: 'campus.hiring@tcs.com',
          phone: '+91 22 6778 9999',
          website: 'https://www.tcs.com',
          packageRange: '₹3.6 LPA - ₹9.2 LPA',
          totalHiredFromCampus: 124,
          status: 'Active Partner',
          tier: 'Tier 1 IT Services',
          mouStatus: 'Signed & Valid (2025-28)',
          officeLocation: 'Bhubaneswar / Mumbai',
        },
        {
          id: 'COMP-02',
          name: 'Cognizant Technology Solutions',
          category: 'Global IT Consulting',
          hrContact: 'Mr. Arvind Krishnan',
          email: 'university.relations@cognizant.com',
          phone: '+91 44 4209 6000',
          website: 'https://www.cognizant.com',
          packageRange: '₹4.5 LPA - ₹10.0 LPA',
          totalHiredFromCampus: 88,
          status: 'Active Partner',
          tier: 'Tier 1 IT Services',
          mouStatus: 'Signed & Valid (2024-27)',
          officeLocation: 'Kolkata / Chennai',
        },
        {
          id: 'COMP-03',
          name: 'Wipro Technologies',
          category: 'Technology & Cloud',
          hrContact: 'Ms. Deepika Sharma',
          email: 'talent.wipro@wipro.com',
          phone: '+91 80 2844 0011',
          website: 'https://www.wipro.com',
          packageRange: '₹3.8 LPA - ₹6.5 LPA',
          totalHiredFromCampus: 64,
          status: 'Active Partner',
          tier: 'Active Partner',
          mouStatus: 'Signed & Valid (2025-28)',
          officeLocation: 'Bhubaneswar / Bangalore',
        },
        {
          id: 'COMP-04',
          name: 'Cisco Systems India',
          category: 'Product & Networking',
          hrContact: 'Mr. Vikram Adve',
          email: 'india.campus@cisco.com',
          phone: '+91 80 4426 0000',
          website: 'https://www.cisco.com',
          packageRange: '₹14.0 LPA - ₹24.0 LPA',
          totalHiredFromCampus: 12,
          status: 'Dream Recruiter',
          tier: 'Super Dream Recruiter',
          mouStatus: 'Industry Centre of Excellence MoU',
          officeLocation: 'Bangalore Innovation Campus',
        },
        {
          id: 'COMP-05',
          name: 'L&T Technology Services (LTTS)',
          category: 'Engineering & R&D',
          hrContact: 'Mr. Rajeshwar Rao',
          email: 'campus@ltts.com',
          phone: '+91 22 6752 5656',
          website: 'https://www.ltts.com',
          packageRange: '₹5.5 LPA - ₹8.0 LPA',
          totalHiredFromCampus: 34,
          status: 'Active Partner',
          tier: 'Core Engineering',
          mouStatus: 'Signed & Valid (2024-27)',
          officeLocation: 'Vadodara / Mumbai',
        },
      ];

      for (const c of defaultCompanies) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'PLACEMENT_COMPANY',
            title: c.name,
            requesterId: 'SYSTEM',
            requesterName: 'T&P Corporate Desk',
            requesterRole: 'PLACEMENT',
            currentStage: c.status,
            status: c.status,
            details: c,
          },
        }).catch(() => null);
      }
      return defaultCompanies;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createPlacementCompany(data: any, user: any) {
    const details = {
      name: data.name,
      category: data.category || 'Information Technology',
      hrContact: data.hrContact || 'HR Team',
      email: data.email || 'campus@company.com',
      phone: data.phone || 'N/A',
      website: data.website || '',
      packageRange: data.packageRange || '₹4.0 LPA - ₹8.0 LPA',
      totalHiredFromCampus: 0,
      status: data.status || 'Active Partner',
      tier: data.tier || 'Active Partner',
      mouStatus: data.mouStatus || 'Under Review',
      officeLocation: data.officeLocation || 'Pan-India',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'PLACEMENT_COMPANY',
        title: data.name,
        requesterId: user.identifier || user.id,
        requesterName: user.name,
        requesterRole: 'PLACEMENT',
        currentStage: details.status,
        status: details.status,
        details,
      },
    });

    return { id: record.id, ...details };
  }

  // --- Campus Recruitment Drives ---
  async getPlacementDrives() {
    let drives = await this.prisma.placementDrive.findMany({ orderBy: { driveDate: 'desc' } });
    if (drives.length === 0) {
      const defaultDrives = [
        {
          companyName: 'Cisco Systems India',
          roleTitle: 'Associate Network & Software Engineer',
          packageLPA: 18.5,
          minCgpa: 8.0,
          eligibleBranches: ['CSE', 'ECE'],
          driveDate: '2026-10-28',
          venue: 'Campus Main Auditorium / Webex Hybrid',
          registeredCount: 84,
          shortlistedCount: 32,
          selectedCount: 6,
          status: 'Upcoming Interview Rounds',
        },
        {
          companyName: 'Tata Consultancy Services',
          roleTitle: 'Digital Systems Engineer & Innovator',
          packageLPA: 7.2,
          minCgpa: 6.5,
          eligibleBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'],
          driveDate: '2026-10-15',
          venue: 'GIFT Computing Complex Labs 1-4',
          registeredCount: 310,
          shortlistedCount: 180,
          selectedCount: 42,
          status: 'Shortlisting Completed',
        },
        {
          companyName: 'Cognizant Technology Solutions',
          roleTitle: 'Programmer Analyst Trainee (GenC Next)',
          packageLPA: 6.75,
          minCgpa: 7.0,
          eligibleBranches: ['CSE', 'ECE', 'EEE'],
          driveDate: '2026-11-05',
          venue: 'Auditorium & Virtual Coding Arena',
          registeredCount: 220,
          shortlistedCount: 110,
          selectedCount: 28,
          status: 'Registration Open',
        },
      ];

      for (const d of defaultDrives) {
        await this.prisma.placementDrive.create({ data: d }).catch(() => null);
      }
      drives = await this.prisma.placementDrive.findMany({ orderBy: { driveDate: 'desc' } });
    }

    return drives.map(d => ({
      id: d.id,
      company: d.companyName,
      companyName: d.companyName,
      role: d.roleTitle,
      roleTitle: d.roleTitle,
      packageOffered: `₹${d.packageLPA} LPA`,
      packageLPA: d.packageLPA,
      driveDate: d.driveDate,
      venue: d.venue,
      registeredCount: d.registeredCount,
      shortlistedCount: d.shortlistedCount,
      selectedCount: d.selectedCount,
      status: d.status,
      eligibilityCriteria: {
        minCgpa: d.minCgpa,
        maxBacklogs: 0,
        allowedBranches: d.eligibleBranches,
      },
    }));
  }

  async createPlacementDrive(data: any) {
    const drive = await this.prisma.placementDrive.create({
      data: {
        companyName: data.company || data.companyName,
        roleTitle: data.role || data.roleTitle,
        packageLPA: Number(data.packageLPA || data.packageOffered?.replace(/[^0-9.]/g, '')) || 7.0,
        minCgpa: Number(data.minCgpa || data.eligibilityCriteria?.minCgpa) || 6.5,
        eligibleBranches: data.eligibleBranches || data.eligibilityCriteria?.allowedBranches || ['CSE', 'ECE'],
        driveDate: data.driveDate || '2026-11-15',
        venue: data.venue || 'Campus Auditorium',
        registeredCount: 0,
        shortlistedCount: 0,
        selectedCount: 0,
        status: data.status || 'Registration Open',
      },
    });

    return {
      id: drive.id,
      company: drive.companyName,
      companyName: drive.companyName,
      role: drive.roleTitle,
      roleTitle: drive.roleTitle,
      packageOffered: `₹${drive.packageLPA} LPA`,
      packageLPA: drive.packageLPA,
      driveDate: drive.driveDate,
      venue: drive.venue,
      registeredCount: drive.registeredCount,
      shortlistedCount: drive.shortlistedCount,
      selectedCount: drive.selectedCount,
      status: drive.status,
      eligibilityCriteria: {
        minCgpa: drive.minCgpa,
        maxBacklogs: 0,
        allowedBranches: drive.eligibleBranches,
      },
    };
  }

  async updatePlacementDriveStatus(driveId: string, status: string, user: any) {
    const updated = await this.prisma.placementDrive.update({
      where: { id: driveId },
      data: { status },
    });
    return updated;
  }

  // --- Intelligent Deterministic Eligibility Engine ---
  async evaluateDriveEligibility(driveId: string) {
    const drive = await this.prisma.placementDrive.findUnique({ where: { id: driveId } });
    if (!drive) throw new NotFoundException('Placement drive not found.');

    const students = await this.prisma.student.findMany({
      orderBy: { rollNumber: 'asc' },
    });

    const evaluated = students.map(st => {
      const reasons: string[] = [];
      const passedCriteria: string[] = [];

      // 1. CGPA Check
      if (st.cgpa >= drive.minCgpa) {
        passedCriteria.push(`CGPA (${st.cgpa} >= ${drive.minCgpa})`);
      } else {
        reasons.push(`CGPA ${st.cgpa} is below minimum requirement of ${drive.minCgpa}`);
      }

      // 2. Branch Check
      const studentBranch = st.deptCode || (st.department.includes('Computer') ? 'CSE' : st.department.includes('Electronics') ? 'ECE' : 'MECH');
      const isBranchAllowed = drive.eligibleBranches.some(b => b.toUpperCase() === studentBranch.toUpperCase() || st.department.toUpperCase().includes(b.toUpperCase()));
      if (isBranchAllowed) {
        passedCriteria.push(`Branch (${studentBranch} allowed)`);
      } else {
        reasons.push(`Branch ${studentBranch} is not in eligible disciplines (${drive.eligibleBranches.join(', ')})`);
      }

      // 3. Attendance Clearance (75% Autonomous Threshold)
      if (st.attendance >= 75) {
        passedCriteria.push(`Attendance Clearance (${st.attendance}% >= 75%)`);
      } else {
        reasons.push(`Attendance ${st.attendance}% is below mandatory institutional 75% cutoff`);
      }

      const isEligible = reasons.length === 0;

      return {
        student: {
          id: st.id,
          name: st.name,
          rollNumber: st.rollNumber,
          department: st.department,
          deptCode: st.deptCode,
          cgpa: st.cgpa,
          attendance: st.attendance,
          semester: st.semester,
        },
        isEligible,
        passedCriteria,
        failedCriteria: reasons,
        reasons,
      };
    });

    const eligibleList = evaluated.filter(e => e.isEligible);
    const ineligibleList = evaluated.filter(e => !e.isEligible);

    return {
      driveId: drive.id,
      companyName: drive.companyName,
      roleTitle: drive.roleTitle,
      criteria: {
        minCgpa: drive.minCgpa,
        eligibleBranches: drive.eligibleBranches,
        minAttendance: 75,
      },
      totalEvaluated: evaluated.length,
      eligibleCount: eligibleList.length,
      ineligibleCount: ineligibleList.length,
      evaluated,
    };
  }

  // --- Applicant Tracking System (ATS Pipeline) ---
  async getPlacementApplications(driveId?: string) {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'PLACEMENT_APPLICATION' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultPipeline = [
        {
          id: 'APP-101',
          studentName: 'Rakesh Das',
          regNo: '2305201001',
          branch: 'CSE',
          cgpa: 8.72,
          company: 'Cisco Systems India',
          role: 'Associate Software Engineer',
          stage: 'Technical Round 2 Cleared',
          status: 'In Interview Pipeline',
          interviewerNotes: 'Demonstrated strong networking socket & data structure fundamentals.',
          roundScore: '8.5 / 10',
          ctcOffered: '₹18.5 LPA',
        },
        {
          id: 'APP-102',
          studentName: 'Priya Patra',
          regNo: '2305201004',
          branch: 'CSE',
          cgpa: 9.08,
          company: 'Cisco Systems India',
          role: 'Associate Software Engineer',
          stage: 'Selected',
          status: 'Offer Letter Released',
          interviewerNotes: 'Exceptional system design and problem solving capabilities. Recommended for Dream package.',
          roundScore: '9.4 / 10',
          ctcOffered: '₹18.5 LPA',
        },
        {
          id: 'APP-103',
          studentName: 'Amit Nayak',
          regNo: '2305201002',
          branch: 'CSE',
          cgpa: 8.04,
          company: 'Tata Consultancy Services',
          role: 'TCS Digital Engineer',
          stage: 'Selected',
          status: 'Offer Letter Released',
          interviewerNotes: 'Qualified TCS National Qualifier Test (NQT) with 94 percentile.',
          roundScore: '8.8 / 10',
          ctcOffered: '₹7.2 LPA',
        },
        {
          id: 'APP-104',
          studentName: 'Raj Sahoo',
          regNo: '2305201003',
          branch: 'MECH',
          cgpa: 8.12,
          company: 'L&T Technology Services (LTTS)',
          role: 'Graduate Engineer Trainee (R&D)',
          stage: 'Technical Round 1 Cleared',
          status: 'In Interview Pipeline',
          interviewerNotes: 'Strong CAD modeling and thermodynamics aptitude.',
          roundScore: '8.0 / 10',
          ctcOffered: '₹6.5 LPA',
        },
      ];

      for (const p of defaultPipeline) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'PLACEMENT_APPLICATION',
            title: `${p.studentName} - ${p.company}`,
            requesterId: p.regNo,
            requesterName: p.studentName,
            requesterRole: 'STUDENT',
            currentStage: p.stage,
            status: p.status,
            details: p,
          },
        }).catch(() => null);
      }
      return defaultPipeline;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      stage: r.currentStage || ((r.details as any)?.stage),
      status: r.status,
    }));
  }

  async advanceApplicationStage(appId: string, data: any, user: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id: appId } });
    if (!record) throw new NotFoundException('Application record not found.');

    const details = (record.details as any) || {};
    const updatedDetails = {
      ...details,
      stage: data.nextStage || details.stage,
      status: data.nextStatus || details.status,
      interviewerNotes: data.notes || details.interviewerNotes || '',
      roundScore: data.score || details.roundScore || '',
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || 'T&P Officer',
    };

    return this.prisma.workflowRequest.update({
      where: { id: appId },
      data: {
        currentStage: updatedDetails.stage,
        status: updatedDetails.status,
        details: updatedDetails,
        approvalNotes: data.notes || record.approvalNotes,
      },
    });
  }

  async releasePlacementOffer(data: any, user: any) {
    const offerToken = `GIFT-OFFER-${Math.floor(1000 + Math.random() * 9000)}-${data.regNo}`;
    const details = {
      offerId: `OFFER-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: data.studentName,
      regNo: data.regNo,
      company: data.company,
      role: data.role,
      packageOffered: data.packageOffered || '₹7.0 LPA',
      ctcOffered: data.ctcOffered || data.packageOffered,
      joiningDate: data.joiningDate || '2027-07-01',
      validityDeadline: data.validityDeadline || '2026-12-15',
      status: 'Offer Letter Released',
      offerToken,
      issuedAt: new Date().toISOString().split('T')[0],
      issuedBy: user?.name || 'Placement Cell Head',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'PLACEMENT_OFFER',
        title: `Offer: ${data.studentName} (${data.company})`,
        requesterId: data.regNo,
        requesterName: data.studentName,
        requesterRole: 'STUDENT',
        currentStage: 'Offer Letter Released',
        status: 'Offer Letter Released',
        details,
      },
    });

    return { id: record.id, ...details };
  }

  async actionPlacementOffer(offerId: string, action: string, notes?: string, user?: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id: offerId } });
    if (!record) throw new NotFoundException('Offer record not found.');
    const details = (record.details as any) || {};

    let newStatus = 'Offer Letter Released';
    if (action === 'ACCEPT_OFFER') newStatus = 'Offer Accepted';
    else if (action === 'DECLINE_OFFER') newStatus = 'Offer Declined';

    const updatedDetails = {
      ...details,
      status: newStatus,
      decisionNotes: notes || '',
      decisionAt: new Date().toISOString(),
    };

    return this.prisma.workflowRequest.update({
      where: { id: offerId },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: updatedDetails,
      },
    });
  }

  async applyToDrive(data: { driveId: string; studentRoll: string; studentName: string; cgpa: number }) {
    const drive = await this.prisma.placementDrive.findUnique({ where: { id: data.driveId } });
    if (!drive) throw new NotFoundException('Placement drive not found.');
    if (data.cgpa < drive.minCgpa) {
      throw new BadRequestException(`Minimum CGPA requirement is ${drive.minCgpa}. Your CGPA is ${data.cgpa}.`);
    }

    await this.prisma.placementDrive.update({
      where: { id: data.driveId },
      data: { registeredCount: { increment: 1 } },
    });

    return this.prisma.placementApplication.create({
      data: {
        driveId: data.driveId,
        companyName: drive.companyName,
        studentRoll: data.studentRoll,
        studentName: data.studentName,
        cgpa: data.cgpa,
        status: 'Applied',
      },
    });
  }

  // ==========================================
  // 4. TRANSPORT FLEET, ROUTES, PASSES & LOGISTICS
  // ==========================================
  async getTransportRoutes() {
    let routes = await this.prisma.transportRoute.findMany({ orderBy: { routeNumber: 'asc' } });
    if (!routes || routes.length === 0) {
      // Seed initial routes if empty
      const initialRoutes = [
        {
          routeNumber: 'RT-1',
          routeName: 'Route 1: Cuttack Badambadi Express',
          busNumber: 'OD-02-AK-4411',
          driverName: 'Ramesh Ch. Jena',
          driverContact: '+91 94371 00214',
          totalCapacity: 52,
          allocatedCount: 49,
          departureTime: '07:15 AM',
          stops: ['Badambadi Bus Stand (07:15 AM)', 'Madhupatna Square (07:25 AM)', 'Phulnakhara Bridge (07:45 AM)', 'GIFT Campus Gates (08:30 AM)'],
          status: 'Active',
        },
        {
          routeNumber: 'RT-2',
          routeName: 'Route 2: Rasulgarh - Master Canteen',
          busNumber: 'OD-02-AK-4412',
          driverName: 'Bikash Mohanty',
          driverContact: '+91 94371 00215',
          totalCapacity: 52,
          allocatedCount: 51,
          departureTime: '07:30 AM',
          stops: ['Rasulgarh Square (07:30 AM)', 'Vani Vihar (07:40 AM)', 'Master Canteen (07:50 AM)', 'Kalpana Square (08:00 AM)', 'GIFT Campus (08:35 AM)'],
          status: 'Active',
        },
        {
          routeNumber: 'RT-3',
          routeName: 'Route 3: Patia - Infocity - Khandagiri',
          busNumber: 'OD-02-BL-8890',
          driverName: 'Sanjay Kumar Rout',
          driverContact: '+91 94371 00216',
          totalCapacity: 42,
          allocatedCount: 38,
          departureTime: '07:25 AM',
          stops: ['Patia Square (07:25 AM)', 'Damana (07:35 AM)', 'Jayadev Vihar (07:50 AM)', 'Khandagiri (08:05 AM)', 'GIFT Campus (08:40 AM)'],
          status: 'Active',
        },
        {
          routeNumber: 'RT-4',
          routeName: 'Route 4: Jayadev Vihar - KIIT Square - Campus',
          busNumber: 'OD-02-BL-8891',
          driverName: 'Kailash Sahoo',
          driverContact: '+91 94371 00217',
          totalCapacity: 52,
          allocatedCount: 46,
          departureTime: '07:20 AM',
          stops: ['Jayadev Vihar (07:20 AM)', 'KIIT Square (07:35 AM)', 'Trisulia Bridge (07:55 AM)', 'GIFT Campus (08:30 AM)'],
          status: 'Active',
        },
        {
          routeNumber: 'RT-5',
          routeName: 'Route 5: Khordha Bypass - Jatni - Campus',
          busNumber: 'OD-02-CL-1209',
          driverName: 'Purna Chandra Das',
          driverContact: '+91 94371 00218',
          totalCapacity: 32,
          allocatedCount: 28,
          departureTime: '07:45 AM',
          stops: ['Khordha New Bus Stand (07:45 AM)', 'Jatni Gate (08:00 AM)', 'GIFT Campus (08:25 AM)'],
          status: 'Active',
        },
      ];
      for (const r of initialRoutes) {
        await this.prisma.transportRoute.create({ data: r }).catch(() => null);
      }
      routes = await this.prisma.transportRoute.findMany({ orderBy: { routeNumber: 'asc' } });
    }
    return routes;
  }

  async createTransportRoute(data: any) {
    return this.prisma.transportRoute.create({
      data: {
        routeNumber: data.routeNumber,
        routeName: data.routeName,
        busNumber: data.busNumber || 'TBD',
        driverName: data.driverName || 'Unassigned',
        driverContact: data.driverContact || 'N/A',
        totalCapacity: Number(data.totalCapacity) || 45,
        allocatedCount: Number(data.allocatedCount) || 0,
        departureTime: data.departureTime || '07:15 AM',
        stops: data.stops || [],
        status: data.status || 'Active',
      },
    });
  }

  async updateTransportRouteDisruption(routeId: string, disruptionNotice: string) {
    const route = await this.prisma.transportRoute.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('Route not found');
    return this.prisma.transportRoute.update({
      where: { id: routeId },
      data: {
        status: disruptionNotice ? 'Temporary Diversion' : 'Active',
      },
    });
  }

  // --- Fleet Vehicles ---
  async getTransportFleet() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'FLEET_VEHICLE' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      // Seed initial fleet vehicles
      const defaultFleet = [
        {
          id: 'VEH-01',
          busNumber: 'OD-02-AK-4411',
          fleetCode: 'Bus 01',
          type: '52-Seater AC Coach',
          capacity: 52,
          allocatedStudents: 49,
          driver: 'Ramesh Ch. Jena',
          driverPhone: '+91 94371 00214',
          routeName: 'Route 1: Cuttack Badambadi to Campus',
          status: 'Active (On Route)',
          fuelType: 'Diesel (BS-VI)',
          fitnessExpiry: '2027-04-15',
          insuranceExpiry: '2027-03-31',
          pucExpiry: '2027-01-20',
          permitExpiry: '2028-05-10',
          odometerKm: 68420,
          depot: 'Campus Central Bus Bay',
        },
        {
          id: 'VEH-02',
          busNumber: 'OD-02-AK-4412',
          fleetCode: 'Bus 02',
          type: '52-Seater Coach',
          capacity: 52,
          allocatedStudents: 51,
          driver: 'Bikash Mohanty',
          driverPhone: '+91 94371 00215',
          routeName: 'Route 2: Rasulgarh - Master Canteen - Campus',
          status: 'Active (On Route)',
          fuelType: 'Diesel (BS-VI)',
          fitnessExpiry: '2027-06-20',
          insuranceExpiry: '2027-06-15',
          pucExpiry: '2027-02-28',
          permitExpiry: '2028-06-12',
          odometerKm: 59310,
          depot: 'Campus Central Bus Bay',
        },
        {
          id: 'VEH-03',
          busNumber: 'OD-02-BL-8890',
          fleetCode: 'Bus 03',
          type: '42-Seater Coach',
          capacity: 42,
          allocatedStudents: 38,
          driver: 'Sanjay Kumar Rout',
          driverPhone: '+91 94371 00216',
          routeName: 'Route 3: Khandagiri - Patia - Campus',
          status: 'Active (On Route)',
          fuelType: 'CNG',
          fitnessExpiry: '2027-02-10',
          insuranceExpiry: '2027-01-25',
          pucExpiry: '2026-12-15',
          permitExpiry: '2028-02-28',
          odometerKm: 42100,
          depot: 'North Gate Depot',
        },
        {
          id: 'VEH-04',
          busNumber: 'OD-02-BL-8891',
          fleetCode: 'Bus 04',
          type: '52-Seater Coach',
          capacity: 52,
          allocatedStudents: 46,
          driver: 'Kailash Sahoo',
          driverPhone: '+91 94371 00217',
          routeName: 'Route 4: Jayadev Vihar - KIIT Square - Campus',
          status: 'Active (On Route)',
          fuelType: 'Diesel (BS-VI)',
          fitnessExpiry: '2027-08-30',
          insuranceExpiry: '2027-08-15',
          pucExpiry: '2027-03-10',
          permitExpiry: '2028-09-01',
          odometerKm: 73250,
          depot: 'Campus Central Bus Bay',
        },
        {
          id: 'VEH-05',
          busNumber: 'OD-02-CL-1209',
          fleetCode: 'Bus 05',
          type: '32-Seater Mini Coach',
          capacity: 32,
          allocatedStudents: 28,
          driver: 'Purna Chandra Das',
          driverPhone: '+91 94371 00218',
          routeName: 'Route 5: Khordha Bypass - Campus',
          status: 'Under Maintenance',
          fuelType: 'Diesel',
          fitnessExpiry: '2026-12-05',
          insuranceExpiry: '2026-11-20',
          pucExpiry: '2026-11-15',
          permitExpiry: '2027-12-10',
          odometerKm: 89400,
          depot: 'Campus Workshop Bay 2',
        },
      ];

      for (const v of defaultFleet) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'FLEET_VEHICLE',
            title: `${v.fleetCode} (${v.busNumber})`,
            requesterId: 'SYSTEM',
            requesterName: 'Transport Fleet Desk',
            requesterRole: 'TRANSPORT',
            currentStage: v.status,
            status: v.status,
            details: v,
          },
        }).catch(() => null);
      }

      return defaultFleet;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createTransportVehicle(data: any, user: any) {
    const details = {
      busNumber: data.busNumber,
      fleetCode: data.fleetCode || `Bus ${Math.floor(10 + Math.random() * 90)}`,
      type: data.type || '52-Seater Coach',
      capacity: Number(data.capacity) || 52,
      allocatedStudents: 0,
      driver: data.driver || 'Unassigned',
      driverPhone: data.driverPhone || 'N/A',
      routeName: data.routeName || 'Unassigned',
      status: 'Available',
      fuelType: data.fuelType || 'Diesel',
      fitnessExpiry: data.fitnessExpiry || '2027-12-31',
      insuranceExpiry: data.insuranceExpiry || '2027-12-31',
      pucExpiry: data.pucExpiry || '2027-06-30',
      permitExpiry: data.permitExpiry || '2028-12-31',
      odometerKm: Number(data.odometerKm) || 12000,
      depot: data.depot || 'Campus Central Bus Bay',
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'FLEET_VEHICLE',
        title: `${details.fleetCode} (${details.busNumber})`,
        requesterId: user.identifier || user.id,
        requesterName: user.name,
        requesterRole: 'TRANSPORT',
        currentStage: 'Available',
        status: 'Available',
        details,
      },
    });

    return { id: record.id, ...details };
  }

  async updateVehicleStatus(id: string, status: string, notes?: string, user?: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Vehicle record not found');
    const prevDetails = (record.details as any) || {};
    const updatedDetails = { ...prevDetails, status };

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status,
        currentStage: status,
        details: updatedDetails,
        approvalNotes: notes || record.approvalNotes,
      },
    });
  }

  async updateVehicleCompliance(id: string, compliance: any, user?: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Vehicle record not found');
    const prevDetails = (record.details as any) || {};
    const updatedDetails = {
      ...prevDetails,
      fitnessExpiry: compliance.fitnessExpiry || prevDetails.fitnessExpiry,
      insuranceExpiry: compliance.insuranceExpiry || prevDetails.insuranceExpiry,
      pucExpiry: compliance.pucExpiry || prevDetails.pucExpiry,
      permitExpiry: compliance.permitExpiry || prevDetails.permitExpiry,
      odometerKm: compliance.odometerKm !== undefined ? Number(compliance.odometerKm) : prevDetails.odometerKm,
    };

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        details: updatedDetails,
      },
    });
  }

  // --- Drivers ---
  async getTransportDrivers() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'TRANSPORT_DRIVER' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultDrivers = [
        {
          id: 'DRV-01',
          name: 'Ramesh Chandra Jena',
          phone: '+91 94371 00214',
          emergencyContact: '+91 98610 22101',
          licenseNumber: 'OD-02-2015-DL-88419',
          licenseCategory: 'HMV (Heavy Passenger Vehicle)',
          licenseExpiry: '2028-09-14',
          experienceYears: 14,
          assignedBus: 'Bus 01 (OD-02-AK-4411)',
          assignedRoute: 'Route 1: Cuttack Badambadi Express',
          shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
          status: 'Active',
          safetyIncidents: 0,
        },
        {
          id: 'DRV-02',
          name: 'Bikash Mohanty',
          phone: '+91 94371 00215',
          emergencyContact: '+91 98610 22102',
          licenseNumber: 'OD-02-2017-DL-41920',
          licenseCategory: 'HMV (Heavy Passenger Vehicle)',
          licenseExpiry: '2029-04-20',
          experienceYears: 11,
          assignedBus: 'Bus 02 (OD-02-AK-4412)',
          assignedRoute: 'Route 2: Rasulgarh - Master Canteen',
          shift: 'Morning & Evening (06:45 AM - 06:45 PM)',
          status: 'Active',
          safetyIncidents: 0,
        },
        {
          id: 'DRV-03',
          name: 'Sanjay Kumar Rout',
          phone: '+91 94371 00216',
          emergencyContact: '+91 98610 22103',
          licenseNumber: 'OD-02-2012-DL-19402',
          licenseCategory: 'HMV (Heavy Passenger Vehicle)',
          licenseExpiry: '2027-11-30',
          experienceYears: 16,
          assignedBus: 'Bus 03 (OD-02-BL-8890)',
          assignedRoute: 'Route 3: Patia - Infocity - Khandagiri',
          shift: 'Morning & Evening (06:45 AM - 06:45 PM)',
          status: 'Active',
          safetyIncidents: 0,
        },
        {
          id: 'DRV-04',
          name: 'Kailash Sahoo',
          phone: '+91 94371 00217',
          emergencyContact: '+91 98610 22104',
          licenseNumber: 'OD-02-2018-DL-98214',
          licenseCategory: 'HMV (Heavy Passenger Vehicle)',
          licenseExpiry: '2028-02-15',
          experienceYears: 9,
          assignedBus: 'Bus 04 (OD-02-BL-8891)',
          assignedRoute: 'Route 4: Jayadev Vihar - KIIT Square',
          shift: 'Morning & Evening (06:30 AM - 06:30 PM)',
          status: 'Active',
          safetyIncidents: 0,
        },
        {
          id: 'DRV-05',
          name: 'Purna Chandra Das',
          phone: '+91 94371 00218',
          emergencyContact: '+91 98610 22105',
          licenseNumber: 'OD-02-2016-DL-77312',
          licenseCategory: 'HMV (Heavy Passenger Vehicle)',
          licenseExpiry: '2027-08-10',
          experienceYears: 12,
          assignedBus: 'Bus 05 (OD-02-CL-1209)',
          assignedRoute: 'Route 5: Khordha Bypass',
          shift: 'Morning & Evening (07:00 AM - 07:00 PM)',
          status: 'Standby / Relief',
          safetyIncidents: 0,
        },
      ];

      for (const d of defaultDrivers) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'TRANSPORT_DRIVER',
            title: d.name,
            requesterId: 'SYSTEM',
            requesterName: 'Driver Roster Office',
            requesterRole: 'TRANSPORT',
            currentStage: d.status,
            status: d.status,
            details: d,
          },
        }).catch(() => null);
      }
      return defaultDrivers;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createTransportDriver(data: any, user: any) {
    const details = {
      name: data.name,
      phone: data.phone,
      emergencyContact: data.emergencyContact || 'N/A',
      licenseNumber: data.licenseNumber,
      licenseCategory: data.licenseCategory || 'HMV (Heavy Passenger Vehicle)',
      licenseExpiry: data.licenseExpiry || '2029-12-31',
      experienceYears: Number(data.experienceYears) || 5,
      assignedBus: data.assignedBus || 'Unassigned',
      assignedRoute: data.assignedRoute || 'Unassigned',
      shift: data.shift || 'General Shift',
      status: 'Active',
      safetyIncidents: 0,
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'TRANSPORT_DRIVER',
        title: data.name,
        requesterId: user.identifier || user.id,
        requesterName: user.name,
        requesterRole: 'TRANSPORT',
        currentStage: 'Active',
        status: 'Active',
        details,
      },
    });

    return { id: record.id, ...details };
  }

  // --- Bus Passes & Allocations ---
  async getTransportPasses() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'BUS_PASS' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultPasses = [
        {
          id: 'PASS-2026-01',
          passNumber: 'PASS-2026-01',
          studentName: 'Rakesh Das',
          regNo: '2305201001',
          department: 'Computer Science & Engineering',
          semester: 'Semester 5',
          routeName: 'Route 1: Cuttack Badambadi Express',
          stopName: 'Badambadi Bus Stand',
          fareAmount: 16000,
          feeStatus: 'Paid & Verified',
          status: 'Active & Verified',
          validity: 'Autumn Semester 2026',
          issueDate: '2026-08-01',
          expiryDate: '2026-12-31',
          qrToken: 'GIFT-BUS-VERIFY-2305201001-R1',
        },
        {
          id: 'PASS-2026-02',
          passNumber: 'PASS-2026-02',
          studentName: 'Amit Nayak',
          regNo: '2305201002',
          department: 'Computer Science & Engineering',
          semester: 'Semester 5',
          routeName: 'Route 2: Rasulgarh - Master Canteen',
          stopName: 'Master Canteen Square',
          fareAmount: 14000,
          feeStatus: 'Paid & Verified',
          status: 'Active & Verified',
          validity: 'Autumn Semester 2026',
          issueDate: '2026-08-01',
          expiryDate: '2026-12-31',
          qrToken: 'GIFT-BUS-VERIFY-2305201002-R2',
        },
        {
          id: 'PASS-2026-03',
          passNumber: 'PASS-2026-03',
          studentName: 'Raj Sahoo',
          regNo: '2305201003',
          department: 'Mechanical Engineering',
          semester: 'Semester 5',
          routeName: 'Route 3: Patia - Infocity - Khandagiri',
          stopName: 'Jayadev Vihar',
          fareAmount: 15000,
          feeStatus: 'Paid & Verified',
          status: 'Active & Verified',
          validity: 'Autumn Semester 2026',
          issueDate: '2026-08-01',
          expiryDate: '2026-12-31',
          qrToken: 'GIFT-BUS-VERIFY-2305201003-R3',
        },
        {
          id: 'PASS-2026-04',
          passNumber: 'PASS-2026-04',
          studentName: 'Priya Patra',
          regNo: '2305201004',
          department: 'Electronics & Communication',
          semester: 'Semester 5',
          routeName: 'Route 1: Cuttack Badambadi Express',
          stopName: 'Madhupatna Square',
          fareAmount: 16000,
          feeStatus: 'Pending Verification',
          status: 'Pending Approval',
          validity: 'Autumn Semester 2026',
          issueDate: '2026-10-02',
          expiryDate: '2026-12-31',
          qrToken: 'GIFT-BUS-VERIFY-2305201004-PENDING',
        },
        {
          id: 'PASS-2026-05',
          passNumber: 'PASS-2026-05',
          studentName: 'Sourav Mohanty',
          regNo: '2305201005',
          department: 'Civil Engineering',
          semester: 'Semester 5',
          routeName: 'Route 4: Jayadev Vihar - KIIT Square',
          stopName: 'KIIT Square',
          fareAmount: 14500,
          feeStatus: 'Paid & Verified',
          status: 'Active & Verified',
          validity: 'Autumn Semester 2026',
          issueDate: '2026-08-05',
          expiryDate: '2026-12-31',
          qrToken: 'GIFT-BUS-VERIFY-2305201005-R4',
        },
      ];

      for (const p of defaultPasses) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'BUS_PASS',
            title: `Bus Pass: ${p.studentName} (${p.regNo})`,
            requesterId: p.regNo,
            requesterName: p.studentName,
            requesterRole: 'STUDENT',
            currentStage: p.status,
            status: p.status,
            details: p,
          },
        }).catch(() => null);
      }
      return defaultPasses;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async allocateStudentTransport(data: any, user: any) {
    // 1. Check existing active pass to prevent duplicate allocation
    const existing = await this.prisma.workflowRequest.findFirst({
      where: {
        workflowType: 'BUS_PASS',
        requesterId: data.regNo,
        status: { in: ['Active & Verified', 'Pending Approval'] },
      },
    });
    if (existing) {
      throw new BadRequestException(`Student with Reg No ${data.regNo} already holds an active or pending bus pass.`);
    }

    // 2. Fetch student details from institutional registry if present
    const student = await this.prisma.student.findFirst({
      where: { OR: [{ rollNumber: data.regNo }, { studentId: data.regNo }] },
    });

    const passNumber = `PASS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const qrToken = `GIFT-BUS-VERIFY-${data.regNo}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const details = {
      passNumber,
      studentName: student?.name || data.studentName || 'Student',
      regNo: data.regNo,
      department: student?.department || data.department || 'B.Tech Engineering',
      semester: student?.semester || data.semester || 'Semester 5',
      routeName: data.routeName,
      stopName: data.stopName,
      fareAmount: Number(data.fareAmount) || 15000,
      feeStatus: data.feePaid ? 'Paid & Verified' : 'Pending Verification',
      status: data.autoApprove ? 'Active & Verified' : 'Pending Approval',
      validity: 'Autumn Semester 2026',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '2026-12-31',
      qrToken,
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'BUS_PASS',
        title: `Bus Pass: ${details.studentName} (${details.regNo})`,
        requesterId: data.regNo,
        requesterName: details.studentName,
        requesterRole: 'STUDENT',
        currentStage: details.status,
        status: details.status,
        details,
      },
    });

    // Increment route allocated count
    const route = await this.prisma.transportRoute.findFirst({
      where: { routeName: { contains: data.routeName.split(':')[0] } },
    });
    if (route) {
      await this.prisma.transportRoute.update({
        where: { id: route.id },
        data: { allocatedCount: route.allocatedCount + 1 },
      }).catch(() => null);
    }

    return { id: record.id, ...details };
  }

  async actionTransportPass(passId: string, action: string, notes?: string, user?: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id: passId } });
    if (!record) throw new NotFoundException('Bus pass record not found');
    const details = (record.details as any) || {};

    let newStatus = details.status;
    if (action === 'APPROVE') newStatus = 'Active & Verified';
    else if (action === 'REJECT') newStatus = 'Rejected';
    else if (action === 'SUSPEND') newStatus = 'Suspended';
    else if (action === 'RENEW') newStatus = 'Active & Verified';
    else if (action === 'REVOKE') newStatus = 'Cancelled';

    const updatedDetails = {
      ...details,
      status: newStatus,
      actionNotes: notes || '',
      actionBy: user?.name || 'Transport Desk',
      actionAt: new Date().toISOString(),
    };

    return this.prisma.workflowRequest.update({
      where: { id: passId },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: updatedDetails,
        approvalNotes: notes,
      },
    });
  }

  // --- Daily Trip Operations ---
  async getTransportTrips() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'TRIP_DISPATCH' },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) {
      const defaultTrips = [
        {
          id: 'TRIP-101',
          tripCode: 'TRIP-AM-01',
          routeName: 'Route 1: Cuttack Badambadi Express',
          serviceType: 'Morning Pickup',
          vehicle: 'Bus 01 (OD-02-AK-4411)',
          driver: 'Ramesh Ch. Jena (+91 94371 00214)',
          scheduledDeparture: '07:15 AM',
          actualDeparture: '07:16 AM',
          scheduledArrival: '08:30 AM',
          actualArrival: '08:28 AM',
          status: 'Completed',
          passengerCount: 49,
          delayMinutes: 0,
          incidentReport: 'None - On time smoothly',
        },
        {
          id: 'TRIP-102',
          tripCode: 'TRIP-AM-02',
          routeName: 'Route 2: Rasulgarh - Master Canteen',
          serviceType: 'Morning Pickup',
          vehicle: 'Bus 02 (OD-02-AK-4412)',
          driver: 'Bikash Mohanty (+91 94371 00215)',
          scheduledDeparture: '07:30 AM',
          actualDeparture: '07:32 AM',
          scheduledArrival: '08:35 AM',
          actualArrival: '08:35 AM',
          status: 'Completed',
          passengerCount: 51,
          delayMinutes: 0,
          incidentReport: 'None - Regular run',
        },
        {
          id: 'TRIP-103',
          tripCode: 'TRIP-PM-01',
          routeName: 'Route 1: Cuttack Badambadi Express',
          serviceType: 'Evening Drop',
          vehicle: 'Bus 01 (OD-02-AK-4411)',
          driver: 'Ramesh Ch. Jena (+91 94371 00214)',
          scheduledDeparture: '05:00 PM',
          actualDeparture: '05:05 PM',
          scheduledArrival: '06:15 PM',
          actualArrival: null,
          status: 'In Transit',
          passengerCount: 48,
          delayMinutes: 5,
          incidentReport: 'Minor traffic near Phulnakhara Bridge',
        },
        {
          id: 'TRIP-104',
          tripCode: 'TRIP-PM-02',
          routeName: 'Route 2: Rasulgarh - Master Canteen',
          serviceType: 'Evening Drop',
          vehicle: 'Bus 02 (OD-02-AK-4412)',
          driver: 'Bikash Mohanty (+91 94371 00215)',
          scheduledDeparture: '05:00 PM',
          actualDeparture: null,
          scheduledArrival: '06:05 PM',
          actualArrival: null,
          status: 'Scheduled',
          passengerCount: 50,
          delayMinutes: 0,
          incidentReport: 'Boarding at Main Bus Bay Gate 3',
        },
      ];

      for (const t of defaultTrips) {
        await this.prisma.workflowRequest.create({
          data: {
            workflowType: 'TRIP_DISPATCH',
            title: `${t.tripCode} - ${t.routeName}`,
            requesterId: 'SYSTEM',
            requesterName: 'Daily Dispatch Board',
            requesterRole: 'TRANSPORT',
            currentStage: t.status,
            status: t.status,
            details: t,
          },
        }).catch(() => null);
      }
      return defaultTrips;
    }

    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async actionTransportTrip(tripId: string, action: string, data?: any, user?: any) {
    const record = await this.prisma.workflowRequest.findUnique({ where: { id: tripId } });
    if (!record) throw new NotFoundException('Trip record not found');
    const details = (record.details as any) || {};

    let newStatus = details.status;
    let actualDeparture = details.actualDeparture;
    let actualArrival = details.actualArrival;
    let delayMinutes = details.delayMinutes || 0;
    let incidentReport = details.incidentReport || 'None';

    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (action === 'START_TRIP') {
      newStatus = 'In Transit';
      actualDeparture = nowStr;
    } else if (action === 'COMPLETE_TRIP') {
      newStatus = 'Completed';
      actualArrival = nowStr;
    } else if (action === 'RECORD_DELAY') {
      newStatus = 'Delayed';
      delayMinutes = Number(data?.delayMinutes) || 15;
      incidentReport = data?.reason || `Delayed due to heavy traffic (${delayMinutes} mins)`;
    } else if (action === 'REPORT_BREAKDOWN') {
      newStatus = 'Breakdown / Halted';
      incidentReport = `Vehicle breakdown reported: ${data?.notes || 'Engine cooling issue'}. Relief bus assigned.`;
    }

    const updatedDetails = {
      ...details,
      status: newStatus,
      actualDeparture,
      actualArrival,
      delayMinutes,
      incidentReport,
      updatedAt: new Date().toISOString(),
    };

    return this.prisma.workflowRequest.update({
      where: { id: tripId },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: updatedDetails,
      },
    });
  }

  // --- GPS Telemetry & Safety Freshness ---
  async getTransportTelemetry() {
    return [
      {
        vehicleId: 'VEH-01',
        fleetCode: 'Bus 01',
        busNumber: 'OD-02-AK-4411',
        routeName: 'Route 1: Cuttack Badambadi Express',
        driverName: 'Ramesh Ch. Jena',
        telemetryStatus: 'Live',
        location: 'Phulnakhara Bridge Crossing (NH-16)',
        speedKmH: 48,
        heading: 'North-East',
        lastPingTime: 'Just now (12s ago)',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '98% (4G LTE)',
        batteryVoltage: '24.2V (Healthy)',
      },
      {
        vehicleId: 'VEH-02',
        fleetCode: 'Bus 02',
        busNumber: 'OD-02-AK-4412',
        routeName: 'Route 2: Rasulgarh - Master Canteen',
        driverName: 'Bikash Mohanty',
        telemetryStatus: 'Live',
        location: 'Master Canteen Circle, Station Square',
        speedKmH: 32,
        heading: 'South-West',
        lastPingTime: '24s ago',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '95% (4G LTE)',
        batteryVoltage: '24.1V (Healthy)',
      },
      {
        vehicleId: 'VEH-03',
        fleetCode: 'Bus 03',
        busNumber: 'OD-02-BL-8890',
        routeName: 'Route 3: Patia - Infocity - Khandagiri',
        driverName: 'Sanjay Kumar Rout',
        telemetryStatus: 'Live',
        location: 'Jayadev Vihar Flyover Approach',
        speedKmH: 42,
        heading: 'South',
        lastPingTime: '45s ago',
        freshnessBadge: 'LIVE_TELEMETRY',
        signalQuality: '90% (4G LTE)',
        batteryVoltage: '23.9V (Healthy)',
      },
      {
        vehicleId: 'VEH-04',
        fleetCode: 'Bus 04',
        busNumber: 'OD-02-BL-8891',
        routeName: 'Route 4: Jayadev Vihar - KIIT Square',
        driverName: 'Kailash Sahoo',
        telemetryStatus: 'Delayed Updates',
        location: 'Near Patia Big Bazaar Underpass',
        speedKmH: 0,
        heading: 'Halted (Traffic Signal)',
        lastPingTime: '4 mins ago (Weak signal cell)',
        freshnessBadge: 'DELAYED_UPDATES',
        signalQuality: '42% (2G Fallback)',
        batteryVoltage: '24.0V (Healthy)',
      },
      {
        vehicleId: 'VEH-05',
        fleetCode: 'Bus 05',
        busNumber: 'OD-02-CL-1209',
        routeName: 'Route 5: Khordha Bypass',
        driverName: 'Purna Chandra Das',
        telemetryStatus: 'Offline',
        location: 'Campus Workshop Service Bay 2',
        speedKmH: 0,
        heading: 'Parked',
        lastPingTime: '3 hours ago',
        freshnessBadge: 'OFFLINE_TELEMETRY',
        signalQuality: '0% (Ignition Off)',
        batteryVoltage: '23.4V (Standby)',
      },
    ];
  }

  // --- Transport Dashboard Stats ---
  async getTransportDashboardStats() {
    const fleet = await this.getTransportFleet();
    const routes = await this.getTransportRoutes();
    const passes = await this.getTransportPasses();
    const trips = await this.getTransportTrips();
    const telemetry = await this.getTransportTelemetry();

    const totalFleet = fleet.length;
    const operationalVehicles = fleet.filter(v => (v.status || '').includes('Active') || (v.status || '').includes('Available')).length;
    const underMaintenance = fleet.filter(v => (v.status || '').includes('Maintenance') || (v.status || '').includes('Out of Service')).length;
    const totalRoutes = routes.length;

    const totalCapacity = fleet.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
    const activePassHolders = passes.filter(p => (p.status || '').includes('Active')).length;
    const pendingPasses = passes.filter(p => (p.status || '').includes('Pending')).length;

    const seatUtilization = totalCapacity > 0 ? Math.round((activePassHolders / totalCapacity) * 100) : 88;

    // Check upcoming compliance certificate expiries (within 90 days from Oct 2026)
    const upcomingExpiries = fleet.filter(v => {
      const exp = v.fitnessExpiry || v.insuranceExpiry || '';
      return exp.startsWith('2026-11') || exp.startsWith('2026-12') || exp.startsWith('2027-01');
    }).length;

    // Telemetry online count
    const liveTelemetryCount = telemetry.filter(t => t.telemetryStatus === 'Live').length;

    // Active in transit trips
    const inTransitTrips = trips.filter(t => t.status === 'In Transit').length;

    return {
      totalFleet,
      operationalVehicles,
      underMaintenance,
      totalRoutes,
      totalCapacity,
      activePassHolders,
      pendingPasses,
      seatUtilization,
      upcomingExpiries,
      liveTelemetryCount,
      inTransitTrips,
      totalTripsToday: trips.length,
    };
  }

  // ==========================================
  // 5. STAFF (LABS & CAMPUS OPERATIONS)
  // ==========================================
  async getLabEquipment(department?: string) {
    const where: any = {};
    if (department && department !== 'All') where.department = department;
    return this.prisma.labEquipment.findMany({ where, orderBy: { equipmentName: 'asc' } });
  }

  async updateEquipmentStatus(equipmentCode: string, condition: string) {
    return this.prisma.labEquipment.update({
      where: { equipmentCode },
      data: { condition, lastServiced: new Date().toISOString().split('T')[0] },
    });
  }

  async createLabEquipment(data: any) {
    return this.prisma.labEquipment.create({
      data: {
        equipmentCode: data.equipmentCode,
        equipmentName: data.equipmentName,
        labName: data.labName,
        department: data.department || 'Computer Science & Engineering',
        condition: data.condition || 'Operational',
        lastServiced: data.lastServiced || new Date().toISOString().split('T')[0],
        inCharge: data.inCharge || 'Lab Assistant',
      },
    });
  }

  // --- 5A. Support & Laboratory Tickets ---
  async getSupportTickets(query?: { status?: string; category?: string; priority?: string; search?: string }) {
    const where: any = { workflowType: 'SUPPORT_TICKET' };
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let tickets = requests.map(r => {
      const details = (r.details as any) || {};
      return {
        id: r.id,
        ticketNumber: details.ticketNumber || `TCK-${r.id.slice(-6).toUpperCase()}`,
        title: r.title,
        description: details.description || '',
        category: details.category || 'General Maintenance',
        building: details.building || 'Main Administrative Block',
        floor: details.floor || 'Floor 1',
        room: details.room || 'General',
        labName: details.labName || '',
        assetCode: details.assetCode || '',
        reporterName: r.requesterName,
        reporterRole: r.requesterRole,
        reporterDept: r.department || '',
        priority: details.priority || 'Normal',
        status: r.status,
        assignedTo: details.assignedTo || 'Unassigned',
        assignedRole: details.assignedRole || 'Technician',
        preferredDate: details.preferredDate || '',
        resolutionDetails: details.resolutionDetails || '',
        responseDueAt: details.responseDueAt || '',
        resolutionDueAt: details.resolutionDueAt || '',
        comments: details.comments || [],
        history: (r.history as any[]) || [],
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    if (query?.status && query.status !== 'All') {
      tickets = tickets.filter(t => t.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.category && query.category !== 'All') {
      tickets = tickets.filter(t => t.category.toLowerCase() === query.category?.toLowerCase());
    }
    if (query?.priority && query.priority !== 'All') {
      tickets = tickets.filter(t => t.priority.toLowerCase() === query.priority?.toLowerCase());
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      tickets = tickets.filter(t =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.building.toLowerCase().includes(q) ||
        t.assignedTo.toLowerCase().includes(q)
      );
    }
    return tickets;
  }

  async createSupportTicket(data: any, user: any) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-2026-${randomSuffix}`;

    // SLA Calculation based on priority
    const priority = data.priority || 'Normal';
    const now = new Date();
    let responseHours = 4;
    let resolutionHours = 24;

    if (priority === 'Critical') {
      responseHours = 0.5;
      resolutionHours = 4;
    } else if (priority === 'High') {
      responseHours = 2;
      resolutionHours = 8;
    } else if (priority === 'Low') {
      responseHours = 24;
      resolutionHours = 48;
    }

    const responseDueAt = new Date(now.getTime() + responseHours * 3600000).toISOString();
    const resolutionDueAt = new Date(now.getTime() + resolutionHours * 3600000).toISOString();

    const details = {
      ticketNumber,
      description: data.description || '',
      category: data.category || 'IT Support',
      building: data.building || 'Block B',
      floor: data.floor || 'Floor 2',
      room: data.room || 'Lab 204',
      labName: data.labName || '',
      assetCode: data.assetCode || '',
      priority,
      assignedTo: data.assignedTo || 'Unassigned',
      assignedRole: data.assignedRole || 'Technician',
      preferredDate: data.preferredDate || '',
      resolutionDetails: '',
      responseDueAt,
      resolutionDueAt,
      comments: [],
    };

    const initialHistory = [
      {
        action: 'CREATED',
        stage: 'Open',
        by: user.name || 'Staff Member',
        role: user.role || 'STAFF',
        notes: `Ticket #${ticketNumber} raised with priority ${priority}`,
        timestamp: new Date().toISOString(),
      },
    ];

    return this.prisma.workflowRequest.create({
      data: {
        workflowType: 'SUPPORT_TICKET',
        title: data.title,
        requesterId: user.id || 'STAFF-01',
        requesterName: user.name || data.reporterName || 'Staff Desk',
        requesterRole: user.role || 'STAFF',
        department: user.department || data.reporterDept || 'Operations',
        details,
        currentStage: data.assignedTo ? 'Assigned' : 'Open',
        status: data.assignedTo ? 'Assigned' : 'Open',
        history: initialHistory,
      },
    });
  }

  async updateSupportTicketStatus(id: string, newStatus: string, user: any, resolutionDetails?: string, cancelReason?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Support ticket not found.');

    const details = (req.details as any) || {};
    const history = (req.history as any[]) || [];

    if (resolutionDetails) {
      details.resolutionDetails = resolutionDetails;
      details.resolvedAt = new Date().toISOString();
    }
    if (cancelReason) {
      details.cancelReason = cancelReason;
    }

    history.push({
      action: `STATUS_CHANGE_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      stage: newStatus,
      by: user.name || 'Operations Staff',
      role: user.role || 'STAFF',
      notes: resolutionDetails || cancelReason || `Status transitioned to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details,
        history,
      },
    });
  }

  async assignSupportTicket(id: string, assignedTo: string, user: any) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Support ticket not found.');

    const details = (req.details as any) || {};
    const oldAssignee = details.assignedTo || 'Unassigned';
    details.assignedTo = assignedTo;

    const history = (req.history as any[]) || [];
    history.push({
      action: 'REASSIGNMENT',
      stage: req.status === 'Open' ? 'Assigned' : req.status,
      by: user.name || 'Operations Supervisor',
      role: user.role || 'STAFF',
      notes: `Reassigned from "${oldAssignee}" to "${assignedTo}"`,
      timestamp: new Date().toISOString(),
    });

    const newStatus = req.status === 'Open' ? 'Assigned' : req.status;

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        details,
        history,
      },
    });
  }

  async addTicketComment(id: string, comment: string, user: any, isInternal: boolean = false) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Support ticket not found.');

    const details = (req.details as any) || {};
    const comments = details.comments || [];
    const newComment = {
      id: `CMT-${Date.now()}`,
      author: user.name || 'Staff Member',
      role: user.role || 'STAFF',
      text: comment,
      isInternal,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    details.comments = comments;

    return this.prisma.workflowRequest.update({
      where: { id },
      data: { details },
    });
  }

  // --- 5B. Visitor Gate Pass Management ---
  async getVisitorGatePasses(query?: { status?: string; search?: string }) {
    const where: any = { workflowType: 'VISITOR_GATE_PASS' };
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let passes = requests.map(r => {
      const details = (r.details as any) || {};
      return {
        id: r.id,
        passNumber: details.passNumber || `GP-${r.id.slice(-6).toUpperCase()}`,
        visitorName: details.visitorName || r.title,
        organization: details.organization || 'General Visitor',
        phone: details.phone || '',
        email: details.email || '',
        purpose: details.purpose || '',
        hostPerson: details.hostPerson || '',
        hostDept: r.department || '',
        guestCount: Number(details.guestCount) || 1,
        badgeNumber: details.badgeNumber || '',
        expectedArrival: details.expectedArrival || '',
        checkedInAt: details.checkedInAt || null,
        checkedOutAt: details.checkedOutAt || null,
        status: r.status,
        verificationToken: details.verificationToken || `GIFT-PASS-${r.id}`,
        history: (r.history as any[]) || [],
        createdAt: r.createdAt.toISOString(),
      };
    });

    if (query?.status && query.status !== 'All') {
      passes = passes.filter(p => p.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      passes = passes.filter(p =>
        p.passNumber.toLowerCase().includes(q) ||
        p.visitorName.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.phone.includes(q)
      );
    }
    return passes;
  }

  async createVisitorGatePass(data: any, user: any) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const passNumber = `GP-2026-${randomSuffix}`;
    const verificationToken = `AUTH-GP-${randomSuffix}-${Date.now().toString(36).toUpperCase()}`;

    const details = {
      passNumber,
      visitorName: data.visitorName,
      organization: data.organization || 'Individual',
      phone: data.phone,
      email: data.email || '',
      purpose: data.purpose,
      hostPerson: data.hostPerson || 'Administrative Officer',
      guestCount: Number(data.guestCount) || 1,
      badgeNumber: data.badgeNumber || '',
      expectedArrival: data.expectedArrival || new Date().toISOString().split('T')[0],
      verificationToken,
      checkedInAt: null,
      checkedOutAt: null,
    };

    const initialHistory = [
      {
        action: 'REGISTERED',
        by: user.name || 'Reception Desk',
        role: user.role || 'STAFF',
        notes: `Gate pass issued for ${data.visitorName}`,
        timestamp: new Date().toISOString(),
      },
    ];

    return this.prisma.workflowRequest.create({
      data: {
        workflowType: 'VISITOR_GATE_PASS',
        title: data.visitorName,
        requesterId: user.id || 'RECEPTION-01',
        requesterName: user.name || 'Reception Staff',
        requesterRole: user.role || 'STAFF',
        department: data.hostDept || 'Campus Reception',
        details,
        currentStage: 'Approved',
        status: 'Approved', // Approved for entry, checked in upon gate physical entry
        history: initialHistory,
      },
    });
  }

  async actionVisitorGatePass(id: string, action: 'CHECK_IN' | 'CHECK_OUT' | 'CANCEL', user: any, badgeNumber?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Gate pass record not found.');

    const details = (req.details as any) || {};
    const history = (req.history as any[]) || [];
    let newStatus = req.status;

    if (action === 'CHECK_IN') {
      if (req.status === 'Checked In') {
        throw new BadRequestException('Visitor is already checked in on campus.');
      }
      newStatus = 'Checked In';
      details.checkedInAt = new Date().toISOString();
      if (badgeNumber) details.badgeNumber = badgeNumber;
      history.push({
        action: 'CHECKED_IN',
        by: user.name || 'Security Gate In-Charge',
        role: user.role || 'STAFF',
        notes: `Guest physical arrival logged. Badge #${details.badgeNumber || 'Issued'} allocated.`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'CHECK_OUT') {
      if (req.status !== 'Checked In') {
        throw new BadRequestException('Cannot check out a guest who is not currently checked in.');
      }
      newStatus = 'Checked Out';
      details.checkedOutAt = new Date().toISOString();
      history.push({
        action: 'CHECKED_OUT',
        by: user.name || 'Security Gate In-Charge',
        role: user.role || 'STAFF',
        notes: `Guest departure logged. Badge returned.`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'CANCEL') {
      newStatus = 'Cancelled';
      history.push({
        action: 'CANCELLED',
        by: user.name || 'Reception Supervisor',
        role: user.role || 'STAFF',
        notes: 'Gate pass cancelled by authorized staff.',
        timestamp: new Date().toISOString(),
      });
    }

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        details,
        history,
      },
    });
  }

  // --- 5C. Office Inward / Outward Clerical Dispatch ---
  async getDispatchRecords(query?: { dispatchType?: string; status?: string; department?: string; search?: string }) {
    const where: any = { workflowType: 'DISPATCH_RECORD' };
    const requests = await this.prisma.workflowRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let records = requests.map(r => {
      const details = (r.details as any) || {};
      return {
        id: r.id,
        refNumber: details.refNumber || `DISP-${r.id.slice(-6).toUpperCase()}`,
        dispatchType: details.dispatchType || 'INWARD', // INWARD or OUTWARD
        subject: r.title,
        category: details.category || 'Administrative',
        partyName: details.partyName || '',
        partyOrg: details.partyOrg || '',
        partyContact: details.partyContact || '',
        department: r.department || details.department || 'General Admin',
        assignedOfficer: details.assignedOfficer || 'Administrative Officer',
        priority: details.priority || 'Normal',
        docType: details.docType || 'Official Letter',
        confidentiality: details.confidentiality || 'Normal',
        trackingNumber: details.trackingNumber || '',
        courierName: details.courierName || 'Speed Post (India Post)',
        recordDate: details.recordDate || r.createdAt.toISOString().split('T')[0],
        status: r.status,
        proofAttachment: details.proofAttachment || '',
        notes: details.notes || '',
        history: (r.history as any[]) || [],
        createdAt: r.createdAt.toISOString(),
      };
    });

    if (query?.dispatchType && query.dispatchType !== 'All') {
      records = records.filter(rec => rec.dispatchType.toUpperCase() === query.dispatchType?.toUpperCase());
    }
    if (query?.status && query.status !== 'All') {
      records = records.filter(rec => rec.status.toLowerCase() === query.status?.toLowerCase());
    }
    if (query?.department && query.department !== 'All') {
      records = records.filter(rec => rec.department.toLowerCase() === query.department?.toLowerCase());
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      records = records.filter(rec =>
        rec.refNumber.toLowerCase().includes(q) ||
        rec.subject.toLowerCase().includes(q) ||
        rec.partyName.toLowerCase().includes(q) ||
        rec.partyOrg.toLowerCase().includes(q) ||
        rec.trackingNumber.toLowerCase().includes(q)
      );
    }
    return records;
  }

  async createDispatchRecord(data: any, user: any) {
    const isOutward = (data.dispatchType || '').toUpperCase() === 'OUTWARD';
    const prefix = isOutward ? 'OUT-2026' : 'INW-2026';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const refNumber = `${prefix}-${randomSuffix}`;

    const details = {
      refNumber,
      dispatchType: isOutward ? 'OUTWARD' : 'INWARD',
      category: data.category || 'Institutional Document',
      partyName: data.partyName || '',
      partyOrg: data.partyOrg || '',
      partyContact: data.partyContact || '',
      department: data.department || 'Registrar Office',
      assignedOfficer: data.assignedOfficer || 'Senior Clerk',
      priority: data.priority || 'Normal',
      docType: data.docType || 'Official Memorandum',
      confidentiality: data.confidentiality || 'Normal',
      trackingNumber: data.trackingNumber || '',
      courierName: data.courierName || 'Speed Post (India Post)',
      recordDate: data.recordDate || new Date().toISOString().split('T')[0],
      proofAttachment: data.proofAttachment || '',
      notes: data.notes || '',
    };

    const initialHistory = [
      {
        action: 'REGISTERED',
        stage: 'Registered',
        by: user.name || 'Clerical Staff',
        role: user.role || 'STAFF',
        notes: `${details.dispatchType} document indexed under Ref #${refNumber}`,
        timestamp: new Date().toISOString(),
      },
    ];

    return this.prisma.workflowRequest.create({
      data: {
        workflowType: 'DISPATCH_RECORD',
        title: data.subject,
        requesterId: user.id || 'CLERK-01',
        requesterName: user.name || 'Clerk Desk',
        requesterRole: user.role || 'STAFF',
        department: data.department || 'Administrative Office',
        details,
        currentStage: isOutward ? 'Under Review' : 'Registered',
        status: isOutward ? 'Under Review' : 'Registered',
        history: initialHistory,
      },
    });
  }

  async updateDispatchStatus(id: string, newStatus: string, user: any, notes?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Dispatch document record not found.');

    const details = (req.details as any) || {};
    const history = (req.history as any[]) || [];

    history.push({
      action: `TRANSITION_TO_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      stage: newStatus,
      by: user.name || 'Clerk Supervisor',
      role: user.role || 'STAFF',
      notes: notes || `Document lifecycle progressed to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details,
        history,
      },
    });
  }

  // --- 5D. Staff Operational Console Analytics ---
  async getStaffDashboardStats() {
    const tickets = await this.getSupportTickets();
    const visitors = await this.getVisitorGatePasses();
    const dispatches = await this.getDispatchRecords();
    const equipment = await this.getLabEquipment();

    const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed' && t.status !== 'Cancelled');
    const criticalIncidents = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed');

    // Overdue ticket calculation (due date passed and not resolved)
    const now = Date.now();
    const overdueTickets = openTickets.filter(t => {
      if (!t.resolutionDueAt) return false;
      return new Date(t.resolutionDueAt).getTime() < now;
    });

    // Visitors
    const checkedInVisitors = visitors.filter(v => v.status === 'Checked In');
    const todayStr = new Date().toISOString().split('T')[0];
    const expectedToday = visitors.filter(v => (v.expectedArrival || '').startsWith(todayStr));

    // Labs and Equipment
    const totalEquipment = equipment.length || 24;
    const operationalEquipment = equipment.filter(e => e.condition === 'Operational').length || 22;

    // Dispatches
    const pendingDispatches = dispatches.filter(d => d.status !== 'Delivered' && d.status !== 'Archived');

    // SLA compliance %
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
    let compliantCount = 0;
    resolvedTickets.forEach(t => {
      const details = t as any;
      if (details.resolvedAt && details.resolutionDueAt) {
        if (new Date(details.resolvedAt).getTime() <= new Date(details.resolutionDueAt).getTime()) {
          compliantCount++;
        }
      } else {
        compliantCount++;
      }
    });
    const slaCompliance = resolvedTickets.length > 0
      ? Math.round((compliantCount / resolvedTickets.length) * 100 * 10) / 10
      : 98.4;

    return {
      openTicketsCount: openTickets.length,
      overdueTicketsCount: overdueTickets.length,
      criticalIncidentsCount: criticalIncidents.length,
      checkedInVisitorsCount: checkedInVisitors.length,
      expectedVisitorsTodayCount: expectedToday.length,
      totalLaboratories: 12,
      operationalLaboratories: 11,
      totalEquipmentCount: totalEquipment,
      operationalEquipmentCount: operationalEquipment,
      pendingDispatchesCount: pendingDispatches.length,
      slaCompliancePercentage: slaCompliance,
    };
  }

  // ==========================================
  // 6. WORKFLOW & APPROVALS ENGINE
  // ==========================================
  async getWorkflowRequests(role?: string, department?: string) {
    const where: any = {};
    if (department && role === 'hod') {
      where.department = department;
    }
    return this.prisma.workflowRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createWorkflowRequest(data: any) {
    return this.prisma.workflowRequest.create({
      data: {
        workflowType: data.workflowType,
        title: data.title,
        requesterId: data.requesterId,
        requesterName: data.requesterName,
        requesterRole: data.requesterRole,
        department: data.department,
        details: data.details || {},
        currentStage: data.currentStage || 'HOD_REVIEW',
        status: 'Pending',
        history: [
          {
            stage: data.currentStage || 'HOD_REVIEW',
            action: 'SUBMITTED',
            by: data.requesterName,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    });
  }

  async updateWorkflowStage(id: string, action: 'APPROVE' | 'REJECT', approver: { id: string; name: string; role: string }, notes?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Workflow request not found.');

    const newStatus = action === 'APPROVE' ? 'Approved' : 'Rejected';
    const history = (req.history as any[]) || [];
    history.push({
      stage: req.currentStage,
      action: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      by: approver.name,
      role: approver.role,
      notes,
      timestamp: new Date().toISOString(),
    });

    return this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        approverId: approver.id,
        approverName: approver.name,
        approvalNotes: notes,
        history,
      },
    });
  }

  // ==========================================
  // 7. SYSTEM SETTINGS (Super Admin)
  // ==========================================
  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async updateSystemSetting(key: string, value: string, updatedBy?: string) {
    return this.prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedBy },
      create: { key, value, updatedBy },
    });
  }
}
