import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

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
    const copies = await this.getLibraryCopies();

    const totalTitles = books.length;
    const totalCopies = books.reduce((sum, b) => sum + (Number(b.totalCopies) || 0), 0);
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
      categoryCounts[cat] = (categoryCounts[cat] || 0) + (Number(b.totalCopies) || 0);
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      copies: count,
      percentage: totalCopies > 0 ? Math.round((count / totalCopies) * 100) : 0,
    }));

    const currentYear = new Date().getFullYear();
    const booksAcquiredYear = acquisitions.reduce((total: number, acquisition: any) => {
      const acquisitionDate = acquisition.receivedDate || acquisition.orderDate || acquisition.acquisitionDate;
      if (typeof acquisitionDate !== 'string' || !acquisitionDate.startsWith(String(currentYear))) return total;
      return total + (Number(acquisition.quantityReceived) || Number(acquisition.quantityRequested) || 0);
    }, 0);
    const monthlyCirculation = Array.from({ length: 6 }, (_, index) => {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setMonth(monthStart.getMonth() - (5 - index));
      const year = monthStart.getFullYear();
      const month = monthStart.getMonth();
      const issues = transactions.filter((transaction: any) => {
        const date = new Date(transaction.issueDate);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
      }).length;
      const returns = transactions.filter((transaction: any) => {
        if (!transaction.returnDate) return false;
        const date = new Date(transaction.returnDate);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
      }).length;
      return { month: monthStart.toLocaleString('en', { month: 'short' }), issues, returns };
    });

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
      lostOrDamaged: copies.filter((copy: any) => /lost|damaged/i.test(String(copy.condition || ''))).length,
      booksAcquiredYear,
      categoryDistribution,
      monthlyCirculation,
    };
  }

  async getLibraryBooks(search?: string, department?: string, category?: string) {
    const count = await this.prisma.libraryBook.count();


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
    const isbn = String(data.isbn).trim();
    const title = String(data.title).trim();
    const author = String(data.author).trim();
    const department = String(data.department || '').trim();
    const category = String(data.category || '').trim();
    const shelfLocation = String(data.shelfLocation || '').trim();
    const totalCopies = Number(data.totalCopies);
    const price = data.price == null ? null : Number(data.price);
    if (!isbn || !title || !author || !department || !category || !shelfLocation || !Number.isInteger(totalCopies) || totalCopies < 0 || totalCopies > 10000 || (price != null && (!Number.isFinite(price) || price < 0))) {
      throw new BadRequestException('Provide ISBN, title, author, department, category, shelf location, a non-negative integer copy count, and a valid optional unit price.');
    }
    const existing = await this.prisma.libraryBook.findUnique({ where: { isbn } });
    if (existing) {
      throw new ConflictException(`A title with ISBN ${isbn} already exists in the catalog.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const newBook = await tx.libraryBook.create({
        data: {
          isbn,
          title,
          author,
          department,
          category,
          totalCopies,
          availableCopies: totalCopies,
          shelfLocation,
        },
      });
      for (let i = 1; i <= totalCopies; i++) {
        const accessionNumber = `ACC-${new Date().getFullYear()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        const barcode = `BC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
        await tx.workflowRequest.create({
          data: {
            workflowType: 'LIBRARY_COPY',
            title: `Copy ${i} - ${newBook.title}`,
            requesterId: newBook.id,
            requesterName: 'Library inventory',
            requesterRole: 'LIBRARY',
            details: {
              bookId: newBook.id,
              isbn: newBook.isbn,
              bookTitle: newBook.title,
              accessionNumber,
              barcode,
              shelfLocation: newBook.shelfLocation,
              condition: 'Good',
              status: 'Available',
              acquisitionDate: new Date().toISOString().split('T')[0],
              price,
            },
            currentStage: 'Registered',
            status: 'Available',
          },
        });
      }
      return newBook;
    });
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



    return copies.map(c => ({
      id: c.id,
      ...((c.details as any) || {}),
    }));
  }

  async registerLibraryCopy(data: any) {
    const book = await this.prisma.libraryBook.findUnique({ where: { id: data.bookId } });
    if (!book) throw new NotFoundException('Parent bibliographic title not found.');
    return this.prisma.$transaction(async (tx) => {
      const price = data.price == null ? null : Number(data.price);
      if (price != null && (!Number.isFinite(price) || price < 0)) throw new BadRequestException('Copy price must be a non-negative amount.');
      const changed = await tx.libraryBook.updateMany({
        where: { id: book.id, totalCopies: book.totalCopies },
        data: { totalCopies: { increment: 1 }, availableCopies: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ConflictException('Catalog inventory changed concurrently. Refresh and retry.');
      const details = {
        bookId: book.id,
        isbn: book.isbn,
        bookTitle: book.title,
        accessionNumber: String(data.accessionNumber || `ACC-${new Date().getFullYear()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`).trim(),
        barcode: String(data.barcode || `BC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`).trim(),
        shelfLocation: String(data.shelfLocation ?? book.shelfLocation).trim(),
        condition: String(data.condition || 'Good').trim(),
        status: 'Available',
        acquisitionDate: data.acquisitionDate || new Date().toISOString().split('T')[0],
        price,
      };
      const copy = await tx.workflowRequest.create({
        data: {
          workflowType: 'LIBRARY_COPY',
          title: `Copy - ${book.title}`,
          requesterId: book.id,
          requesterName: 'Library inventory',
          requesterRole: 'LIBRARY',
          details,
          currentStage: 'Registered',
          status: 'Available',
        },
      });
      return { id: copy.id, ...details };
    });
  }

  async updateLibraryCopyStatus(copyId: string, status: string, notes?: string) {
    const allowedStatuses = ['Available', 'Lost', 'Damaged', 'Under Repair', 'Withdrawn'];
    if (!allowedStatuses.includes(status)) throw new BadRequestException('Unsupported library copy status.');
    return this.prisma.$transaction(async (tx) => {
      const copy = await tx.workflowRequest.findFirst({ where: { id: copyId, workflowType: 'LIBRARY_COPY' } });
      if (!copy) throw new NotFoundException('Physical copy record not found.');
      const currentDetails = (copy.details as any) || {};
      const oldStatus = String(currentDetails.status || copy.status);
      if (oldStatus === 'Issued') throw new BadRequestException('Issued copy status is controlled by the loan return workflow.');
      if (oldStatus === status) return { id: copy.id, ...currentDetails };

      if (oldStatus === 'Available' && status !== 'Available') {
        const adjusted = await tx.libraryBook.updateMany({
          where: { id: currentDetails.bookId, availableCopies: { gte: 1 } },
          data: { availableCopies: { decrement: 1 } },
        });
        if (adjusted.count !== 1) throw new ConflictException('Available copy count is inconsistent with the copy record.');
      } else if (oldStatus !== 'Available' && status === 'Available') {
        await tx.libraryBook.update({ where: { id: currentDetails.bookId }, data: { availableCopies: { increment: 1 } } });
      }

      const updatedDetails = { ...currentDetails, status, ...(notes ? { statusNotes: notes.trim().slice(0, 1000) } : {}) };
      const updated = await tx.workflowRequest.updateMany({
        where: { id: copyId, workflowType: 'LIBRARY_COPY', status: copy.status },
        data: { status, details: updatedDetails, approvalNotes: notes?.trim().slice(0, 1000) || `Status changed to ${status}` },
      });
      if (updated.count !== 1) throw new ConflictException('Copy record changed concurrently. Refresh and retry.');
      const result = await tx.workflowRequest.findUniqueOrThrow({ where: { id: copyId } });
      return { id: result.id, ...((result.details as any) || {}) };
    });
  }

  async getLibraryTransactions(studentRoll?: string, statusFilter?: string) {
    const count = await this.prisma.libraryTransaction.count();


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

  async issueBook(data: { bookId: string; studentRoll: string }) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.libraryBook.findUnique({ where: { id: data.bookId } });
      if (!book) throw new NotFoundException('Book not found');

      // The borrower name and borrowing class come from institutional identity
      // records; callers cannot raise their quota by submitting a role/name.
      let borrowerName: string | undefined;
      let role: 'Student' | 'Faculty' | 'Staff' | undefined;
      const student = await tx.student.findUnique({ where: { rollNumber: data.studentRoll }, select: { name: true } });
      if (student) {
        borrowerName = student.name;
        role = 'Student';
      } else {
        const faculty = await tx.faculty.findUnique({ where: { employeeId: data.studentRoll }, select: { name: true } });
        if (faculty) {
          borrowerName = faculty.name;
          role = 'Faculty';
        } else {
          const account = await tx.user.findFirst({ where: { identifier: data.studentRoll }, select: { name: true, role: true, isActive: true } });
          if (account?.isActive && ['STAFF', 'NON_TEACHING', 'MAINTENANCE'].includes(account.role)) {
            borrowerName = account.name;
            role = 'Staff';
          }
        }
      }
      if (!borrowerName || !role) throw new NotFoundException('Borrower was not found in the active student, faculty, or staff directory.');

      const activeLoans = await tx.libraryTransaction.count({
        where: { studentRoll: data.studentRoll, status: { in: ['Issued', 'Overdue'] } },
      });
      const maxLimit = role === 'Faculty' ? 6 : role === 'Staff' ? 2 : 3;
      if (activeLoans >= maxLimit) throw new BadRequestException(`Borrower has reached the active borrowing limit (${maxLimit}).`);

      const copy = await tx.workflowRequest.findFirst({
        where: { workflowType: 'LIBRARY_COPY', requesterId: book.id, status: 'Available' },
        orderBy: { createdAt: 'asc' },
      });
      if (!copy) throw new ConflictException('No available physical copy record exists; reconcile the library inventory before issuing this title.');

      const decremented = await tx.libraryBook.updateMany({
        where: { id: data.bookId, availableCopies: { gte: 1 } },
        data: { availableCopies: { decrement: 1 } },
      });
      if (decremented.count !== 1) throw new BadRequestException('No available copies remain for this title.');
      const copyDetails = { ...((copy.details as any) || {}), status: 'Issued', issuedTo: data.studentRoll };
      const claimedCopy = await tx.workflowRequest.updateMany({
        where: { id: copy.id, workflowType: 'LIBRARY_COPY', status: 'Available' },
        data: { status: 'Issued', details: copyDetails },
      });
      if (claimedCopy.count !== 1) throw new ConflictException('The physical copy was just issued to another borrower.');

      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + (role === 'Faculty' ? 90 : role === 'Staff' ? 14 : 21));
      return tx.libraryTransaction.create({
        data: {
          bookId: data.bookId,
          copyId: copy.id,
          bookTitle: book.title,
          studentRoll: data.studentRoll,
          studentName: borrowerName,
          issueDate: today.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'Issued',
          fineAmount: 0,
        },
      });
    });
  }

  async returnBook(transactionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const txn = await tx.libraryTransaction.findUnique({ where: { id: transactionId } });
      if (!txn) throw new NotFoundException('Transaction record not found');
      if (!['Issued', 'Overdue'].includes(txn.status)) throw new BadRequestException('Only active loans can be returned.');

      const borrower = await tx.student.findUnique({ where: { rollNumber: txn.studentRoll }, select: { id: true } });
      const faculty = borrower ? null : await tx.faculty.findUnique({ where: { employeeId: txn.studentRoll }, select: { id: true } });
      const role = borrower ? 'Student' : faculty ? 'Faculty' : 'Staff';
      const { overdueDays, fineAmount } = this.getFineCalculation(txn.dueDate, role);
      const returnDate = new Date().toISOString().split('T')[0];
      const changed = await tx.libraryTransaction.updateMany({
        where: { id: transactionId, status: txn.status },
        data: { returnDate, status: 'Returned', fineAmount },
      });
      if (changed.count !== 1) throw new ConflictException('This loan was updated concurrently. Refresh and retry.');
      await tx.libraryBook.update({ where: { id: txn.bookId }, data: { availableCopies: { increment: 1 } } });
      if (txn.copyId) {
        const copy = await tx.workflowRequest.findFirst({ where: { id: txn.copyId, workflowType: 'LIBRARY_COPY', status: 'Issued' } });
        if (!copy) throw new ConflictException('The physical copy record is inconsistent with this loan.');
        const copyDetails = { ...((copy.details as any) || {}), status: 'Available', issuedTo: null };
        const returnedCopy = await tx.workflowRequest.updateMany({
          where: { id: copy.id, workflowType: 'LIBRARY_COPY', status: 'Issued' },
          data: { status: 'Available', details: copyDetails },
        });
        if (returnedCopy.count !== 1) throw new ConflictException('The physical copy changed concurrently.');
      }

      if (fineAmount > 0) {
        const fineTitle = `Overdue Fine ${txn.id} - ${txn.studentName} (${txn.bookTitle})`;
        const existingFine = await tx.workflowRequest.findFirst({ where: { workflowType: 'LIBRARY_FINE_PAYMENT', title: fineTitle } });
        if (!existingFine) {
          await tx.workflowRequest.create({
            data: {
              workflowType: 'LIBRARY_FINE_PAYMENT',
              title: fineTitle,
              requesterId: txn.studentRoll,
              requesterName: txn.studentName,
              requesterRole: role,
              details: { transactionId: txn.id, bookTitle: txn.bookTitle, studentRoll: txn.studentRoll, studentName: txn.studentName, overdueDays, fineAmount, status: 'Unpaid', issuedDate: txn.issueDate, returnedDate: returnDate },
              currentStage: 'Pending Settlement',
              status: 'Unpaid',
            },
          });
        }
      }
      const updated = await tx.libraryTransaction.findUniqueOrThrow({ where: { id: transactionId } });
      return { ...updated, overdueDays, fineAmount };
    });
  }

  async renewBook(transactionId: string, borrowerRoll?: string) {
    const txn = await this.prisma.libraryTransaction.findUnique({ where: { id: transactionId } });
    if (!txn) throw new NotFoundException('Loan record not found');
    if (borrowerRoll && txn.studentRoll !== borrowerRoll) throw new ForbiddenException('You can renew only your own loan.');
    if (txn.status !== 'Issued') throw new BadRequestException('Only actively issued books can be renewed.');

    const currentDue = new Date(txn.dueDate);
    const today = new Date();
    if (today > currentDue) {
      throw new BadRequestException('Cannot renew an overdue book. Please clear accrued overdue fines at circulation counter first.');
    }

    // Extend by 21 days from current due date
    currentDue.setDate(currentDue.getDate() + 21);
    const newDueDate = currentDue.toISOString().split('T')[0];

    const changed = await this.prisma.libraryTransaction.updateMany({
      where: { id: transactionId, status: 'Issued', dueDate: txn.dueDate, ...(borrowerRoll ? { studentRoll: borrowerRoll } : {}) },
      data: { dueDate: newDueDate },
    });
    if (changed.count !== 1) throw new ConflictException('Loan changed concurrently. Refresh and retry.');
    return this.prisma.libraryTransaction.findUniqueOrThrow({ where: { id: transactionId } });
  }

  // --- Book Reservations & Waitlists ---
  async getLibraryReservations() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_RESERVATION' },
      orderBy: { createdAt: 'desc' },
    });



    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async createLibraryReservation(data: { bookTitle: string; isbn: string; studentName: string; studentRoll: string }) {
    const book = await this.prisma.libraryBook.findUnique({ where: { isbn: data.isbn.trim() } });
    if (!book) throw new NotFoundException('The requested ISBN is not in the library catalog.');
    const student = await this.prisma.student.findUnique({ where: { rollNumber: data.studentRoll }, select: { name: true } });
    if (!student || student.name !== data.studentName) throw new ForbiddenException('Reservation identity does not match the linked student record.');
    if (book.availableCopies > 0) throw new BadRequestException('A copy is currently available; place a circulation request instead of joining the waitlist.');
    const existing = await this.prisma.workflowRequest.findFirst({
      where: { workflowType: 'LIBRARY_RESERVATION', requesterId: data.studentRoll, status: { in: ['Queued', 'Ready for Pickup'] }, title: `Reservation: ${book.title} by ${student.name}` },
    });
    if (existing) throw new ConflictException('You already have an active reservation for this title.');
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5);

    const reservation = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_RESERVATION',
        title: `Reservation: ${book.title} by ${student.name}`,
        requesterId: data.studentRoll,
        requesterName: student.name,
        requesterRole: 'Student',
        details: {
          bookTitle: book.title,
          isbn: book.isbn,
          studentName: student.name,
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

  async cancelLibraryReservation(id: string, studentRoll?: string) {
    const reservation = await this.prisma.workflowRequest.findFirst({
      where: { id, workflowType: 'LIBRARY_RESERVATION', ...(studentRoll ? { requesterId: studentRoll } : {}) },
    });
    if (!reservation) throw new NotFoundException('Reservation not found in your permitted scope.');
    if (reservation.status === 'Cancelled') throw new ConflictException('Reservation is already cancelled.');
    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'LIBRARY_RESERVATION', status: reservation.status, ...(studentRoll ? { requesterId: studentRoll } : {}) },
      data: { status: 'Cancelled', currentStage: 'Cancelled' },
    });
    if (changed.count !== 1) throw new ConflictException('Reservation changed while cancellation was processing. Refresh and try again.');
    return this.prisma.workflowRequest.findUniqueOrThrow({ where: { id } });
  }

  // --- Overdue Fines & Penalty Settlement ---
  async getLibraryFines() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_FINE_PAYMENT' },
      orderBy: { createdAt: 'desc' },
    });



    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async settleLibraryFine(
    data: { fineId?: string; studentRoll: string; amountPaid: number; paymentMode: string },
    actor: { id: string; name: string; role: string },
  ) {
    if (!data.fineId) throw new BadRequestException('A persisted fine ID is required to record a settlement.');
    const amountPaid = Number(data.amountPaid);
    if (!Number.isFinite(amountPaid) || amountPaid <= 0 || Math.round(amountPaid * 100) !== amountPaid * 100) {
      throw new BadRequestException('Settlement amount must be a positive currency amount with at most two decimals.');
    }
    const fineRecord = await this.prisma.workflowRequest.findFirst({ where: { id: data.fineId, workflowType: 'LIBRARY_FINE_PAYMENT' } });
    if (!fineRecord) throw new NotFoundException('Library fine record not found.');
    const details = (fineRecord.details as any) || {};
    if (details.studentRoll !== data.studentRoll) throw new BadRequestException('Fine record does not belong to the supplied student.');
    if (!['Unpaid', 'Partial'].includes(fineRecord.status)) throw new ConflictException(`A ${fineRecord.status} fine cannot receive another settlement.`);
    const fineAmount = Number(details.fineAmount);
    const priorPaid = Number(details.amountPaid) || 0;
    const balance = Math.max(0, fineAmount - priorPaid);
    if (!Number.isFinite(fineAmount) || fineAmount <= 0 || amountPaid > balance) {
      throw new BadRequestException('Settlement amount exceeds the outstanding fine balance.');
    }
    const paidTotal = Math.round((priorPaid + amountPaid) * 100) / 100;
    const remaining = Math.round((fineAmount - paidTotal) * 100) / 100;
    const nextStatus = remaining === 0 ? 'Paid' : 'Partial';
    const paidDate = new Date().toISOString().split('T')[0];
    const receiptNo = `LIB-REC-${crypto.randomBytes(10).toString('hex').toUpperCase()}`;
    const updatedDetails = {
      ...details,
      amountPaid: paidTotal,
      balance: remaining,
      status: nextStatus,
      payments: [...(Array.isArray(details.payments) ? details.payments : []), { amount: amountPaid, paymentMode: data.paymentMode.trim(), receiptNo, paidDate, recordedBy: actor.name, actorId: actor.id, actorRole: actor.role }],
      paymentMode: data.paymentMode.trim(),
      receiptNo,
      paidDate,
    };
    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id: data.fineId, workflowType: 'LIBRARY_FINE_PAYMENT', status: fineRecord.status, updatedAt: fineRecord.updatedAt },
      data: { status: nextStatus, currentStage: nextStatus, details: updatedDetails },
    });
    if (changed.count !== 1) throw new ConflictException('Fine record changed while payment was being recorded. Refresh and retry.');
    return { id: fineRecord.id, ...updatedDetails };
  }

  async waiveLibraryFine(data: { fineId: string; reason: string; approvedBy: string }) {
    const fine = await this.prisma.workflowRequest.findFirst({ where: { id: data.fineId, workflowType: 'LIBRARY_FINE_PAYMENT' } });
    if (!fine) throw new NotFoundException('Fine record not found');
    if (!['Unpaid', 'Partial'].includes(fine.status)) throw new ConflictException(`A ${fine.status} fine cannot be waived.`);

    const details = { ...((fine.details as any) || {}), status: 'Waived', balance: 0, waivedReason: data.reason.trim(), waivedBy: data.approvedBy, waivedDate: new Date().toISOString().split('T')[0] };
    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id: fine.id, workflowType: 'LIBRARY_FINE_PAYMENT', status: fine.status },
      data: { status: 'Waived', currentStage: 'Waived', approvalNotes: `Fine waived: ${data.reason.trim()}`, details },
    });
    if (changed.count !== 1) throw new ConflictException('Fine record changed while the waiver was being processed. Refresh and retry.');
    return this.prisma.workflowRequest.findUniqueOrThrow({ where: { id: fine.id } });
  }

  // --- Acquisitions & Stock Indents ---
  async getLibraryAcquisitions() {
    const list = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'LIBRARY_ACQUISITION' },
      orderBy: { createdAt: 'desc' },
    });



    return list.map(item => ({
      id: item.id,
      ...((item.details as any) || {}),
      status: item.status,
    }));
  }

  async createLibraryAcquisition(data: any, user: any) {
    const bookTitle = String(data?.bookTitle || '').trim();
    const author = String(data?.author || '').trim();
    const vendor = String(data?.vendor || '').trim();
    const department = String(data?.department || '').trim();
    const quantityRequested = Number(data?.quantityRequested);
    const unitPrice = Number(data?.unitPrice);
    if (!bookTitle || !author || !vendor || !department || !Number.isInteger(quantityRequested) || quantityRequested < 1 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new BadRequestException('Title, author, vendor, department, positive integer quantity, and unit price are required.');
    }
    const poNumber = String(data.poNumber || `REQ-${new Date().getFullYear()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`).trim();
    const totalCost = Math.round(quantityRequested * unitPrice * 100) / 100;

    const acquisition = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'LIBRARY_ACQUISITION',
        title: `Requisition: ${poNumber} - ${bookTitle}`,
        requesterId: user?.id,
        requesterName: user?.name || user?.identifier,
        requesterRole: 'LIBRARY',
        details: {
          poNumber,
          bookTitle,
          author,
          vendor,
          department,
          quantityRequested,
          quantityReceived: 0,
          unitPrice,
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
    const [drives, companies, applications, students] = await Promise.all([
      this.getPlacementDrives(),
      this.getPlacementCompanies(),
      this.getPlacementApplications(),
      this.prisma.student.findMany({ select: { rollNumber: true, department: true, deptCode: true, cgpa: true, attendance: true } }),
    ]);
    const hasOffer = (application: any) => {
      const status = String(application.status || '').toLowerCase();
      return !/(not selected|rejected|withdrawn)/.test(status) && /(offer|selected|placed)/.test(status);
    };
    const offers = applications.filter(hasOffer);
    const placedRolls = new Set(offers.map((application: any) => application.regNo || application.studentRoll).filter(Boolean));
    const totalDrives = drives.length;
    const totalRecruiters = companies.length;
    const eligibleStudents = students.filter((student) => drives.some((drive: any) => {
      const branches = drive.eligibilityCriteria?.allowedBranches || [];
      const branch = String(student.deptCode || student.department).toUpperCase();
      const matchesBranch = branches.some((allowed: string) => branch.includes(String(allowed).toUpperCase()));
      return matchesBranch && student.cgpa != null && student.attendance != null
        && student.cgpa >= Number(drive.eligibilityCriteria?.minCgpa)
        && student.attendance >= 75;
    }));

    const cohortByBranch = new Map<string, { branch: string; code: string; eligible: number; placedRolls: Set<string>; offers: number }>();
    for (const student of eligibleStudents) {
      const code = student.deptCode || student.department;
      const bucket = cohortByBranch.get(code) || { branch: student.department, code, eligible: 0, placedRolls: new Set<string>(), offers: 0 };
      bucket.eligible++;
      cohortByBranch.set(code, bucket);
    }
    for (const offer of offers) {
      const student = students.find((row) => row.rollNumber === (offer.regNo || offer.studentRoll));
      if (!student) continue;
      const code = student.deptCode || student.department;
      const bucket = cohortByBranch.get(code) || { branch: student.department, code, eligible: 0, placedRolls: new Set<string>(), offers: 0 };
      bucket.offers++;
      bucket.placedRolls.add(student.rollNumber);
      cohortByBranch.set(code, bucket);
    }
    const branchStats = [...cohortByBranch.values()].map((bucket) => ({
      branch: bucket.branch,
      code: bucket.code,
      eligible: bucket.eligible,
      placed: bucket.placedRolls.size,
      offers: bucket.offers,
      placementRate: bucket.eligible ? Math.round((bucket.placedRolls.size / bucket.eligible) * 1000) / 10 : null,
    }));

    const packageValues = offers.map((offer: any) => Number(offer.packageLPA) || Number(String(offer.ctcOffered || offer.packageOffered || '').replace(/[^0-9.]/g, ''))).filter((value: number) => value > 0);
    const reportedPackages = packageValues.length ? packageValues : drives.map((drive: any) => Number(drive.packageLPA)).filter((value: number) => value > 0);
    const sortedPackages = [...reportedPackages].sort((a, b) => a - b);
    const averageCTC = sortedPackages.length ? Number((sortedPackages.reduce((sum, value) => sum + value, 0) / sortedPackages.length).toFixed(2)) : null;
    const medianCTC = sortedPackages.length ? sortedPackages[Math.floor(sortedPackages.length / 2)] : null;
    const highestCTC = sortedPackages.length ? sortedPackages[sortedPackages.length - 1] : null;
    const tierDefinitions = [
      { tier: 'Super Dream (₹12+ LPA)', min: 12, max: Infinity },
      { tier: 'Dream Recruiters (₹6 - ₹12 LPA)', min: 6, max: 12 },
      { tier: 'Core & IT Services (below ₹6 LPA)', min: 0, max: 6 },
    ];
    const tierStats = tierDefinitions.map(({ tier, min, max }) => {
      const offersCount = packageValues.filter((value) => value >= min && value < max).length;
      return { tier, offersCount, percentage: packageValues.length ? Math.round((offersCount / packageValues.length) * 1000) / 10 : 0 };
    });

    const eligibleCohort = eligibleStudents.length;
    const knownRolls = new Set(students.map((student) => student.rollNumber));
    const placedStudents = [...placedRolls].filter((roll) => knownRolls.has(roll)).length;
    const totalOffers = offers.length;
    const placementRate = eligibleCohort ? Math.round((placedStudents / eligibleCohort) * 1000) / 10 : null;

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



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createPlacementCompany(data: any, user: any) {
    const name = String(data?.name || '').trim();
    const email = String(data?.email || '').trim().toLowerCase();
    if (name.length < 2 || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid company name and HR email are required.');
    }
    const existing = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'PLACEMENT_COMPANY' },
      select: { details: true },
    });
    if (existing.some((record) => String((record.details as any)?.email || '').toLowerCase() === email)) {
      throw new ConflictException('This company email is already registered.');
    }
    const details = {
      name,
      category: String(data.category || '').trim() || null,
      hrContact: String(data.hrContact || '').trim() || null,
      email,
      phone: String(data.phone || '').trim() || null,
      website: String(data.website || '').trim() || null,
      packageRange: String(data.packageRange || '').trim() || null,
      totalHiredFromCampus: 0,
      status: 'Active Partner',
      tier: String(data.tier || '').trim() || null,
      mouStatus: String(data.mouStatus || '').trim() || 'Under Review',
      officeLocation: String(data.officeLocation || '').trim() || null,
    };

    const record = await this.prisma.workflowRequest.create({
      data: {
        workflowType: 'PLACEMENT_COMPANY',
        title: name,
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
    const companyName = String(data?.company || data?.companyName || '').trim();
    const roleTitle = String(data?.role || data?.roleTitle || '').trim();
    const packageLPA = Number(data?.packageLPA || data?.packageOffered?.replace(/[^0-9.]/g, ''));
    const minCgpa = Number(data?.minCgpa ?? data?.eligibilityCriteria?.minCgpa);
    const branchInput = data?.eligibleBranches || data?.eligibilityCriteria?.allowedBranches;
    const eligibleBranches = (Array.isArray(branchInput) ? branchInput : [])
      .map((branch: unknown) => String(branch).trim()).filter(Boolean);
    const driveDate = String(data?.driveDate || '');
    const dateValue = Date.parse(driveDate);
    const venue = String(data?.venue || '').trim();
    if (!companyName || !roleTitle || !Number.isFinite(packageLPA) || packageLPA <= 0 || !Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10 || !eligibleBranches.length || !Number.isFinite(dateValue) || !venue) {
      throw new BadRequestException('Company, role, positive package, CGPA cutoff (0–10), eligible branches, date, and venue are required.');
    }
    const drive = await this.prisma.placementDrive.create({
      data: {
        companyName,
        roleTitle,
        packageLPA,
        minCgpa,
        eligibleBranches,
        driveDate,
        venue,
        registeredCount: 0,
        shortlistedCount: 0,
        selectedCount: 0,
        status: 'Registration Open',
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
      if (st.cgpa != null && st.cgpa >= drive.minCgpa) {
        passedCriteria.push(`CGPA (${st.cgpa} >= ${drive.minCgpa})`);
      } else if (st.cgpa == null) {
        reasons.push('CGPA is not recorded');
      } else {
        reasons.push(`CGPA ${st.cgpa} is below minimum requirement of ${drive.minCgpa}`);
      }

      // 2. Branch Check
      const studentBranch = st.deptCode || st.department;
      const isBranchAllowed = drive.eligibleBranches.some(b => b.toUpperCase() === studentBranch.toUpperCase() || st.department.toUpperCase().includes(b.toUpperCase()));
      if (isBranchAllowed) {
        passedCriteria.push(`Branch (${studentBranch} allowed)`);
      } else {
        reasons.push(`Branch ${studentBranch} is not in eligible disciplines (${drive.eligibleBranches.join(', ')})`);
      }

      // 3. Attendance Clearance (75% Autonomous Threshold)
      if (st.attendance != null && st.attendance >= 75) {
        passedCriteria.push(`Attendance Clearance (${st.attendance}% >= 75%)`);
      } else if (st.attendance == null) {
        reasons.push('Attendance is not recorded');
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
    const [applications, legacyRecords] = await Promise.all([
      this.prisma.placementApplication.findMany({ where: driveId ? { driveId } : {}, orderBy: { appliedAt: 'desc' } }),
      this.prisma.workflowRequest.findMany({ where: { workflowType: 'PLACEMENT_APPLICATION' }, orderBy: { createdAt: 'desc' } }),
    ]);
    const current = applications.map((application) => ({
      id: application.id,
      driveId: application.driveId,
      companyName: application.companyName,
      company: application.companyName,
      studentRoll: application.studentRoll,
      regNo: application.studentRoll,
      studentName: application.studentName,
      cgpa: application.cgpa,
      stage: application.currentStage,
      status: application.status,
      appliedAt: application.appliedAt,
      interviewerNotes: application.interviewerNotes,
      roundScore: application.roundScore,
    }));
    const legacy = legacyRecords.map((record) => ({
      id: record.id,
      ...((record.details as any) || {}),
      stage: record.currentStage || ((record.details as any)?.stage),
      status: record.status,
    })).filter((record) => !driveId || record.driveId === driveId);
    return [...current, ...legacy].sort((a, b) => new Date(b.appliedAt || b.createdAt || 0).getTime() - new Date(a.appliedAt || a.createdAt || 0).getTime());
  }

  async advanceApplicationStage(appId: string, data: any, user: any) {
    const application = await this.prisma.placementApplication.findUnique({ where: { id: appId } });
    if (application) {
      if (typeof data?.nextStage !== 'string' || !data.nextStage.trim() || data.nextStage.length > 120) {
        throw new BadRequestException('A valid next stage is required.');
      }
      const validStatuses = ['Applied', 'Shortlisted', 'In Interview Pipeline', 'Selected', 'Rejected', 'Withdrawn', 'Offer Letter Released'];
      if (!validStatuses.includes(data?.nextStatus)) throw new BadRequestException('The requested applicant status is invalid.');
      if (['Selected', 'Rejected', 'Withdrawn', 'Offer Letter Released'].includes(application.status)) {
        throw new BadRequestException(`A ${application.status} application cannot advance further.`);
      }
      const changed = await this.prisma.placementApplication.updateMany({
        where: { id: appId, status: application.status, updatedAt: application.updatedAt },
        data: {
          currentStage: data.nextStage.trim(),
          status: data.nextStatus,
          interviewerNotes: typeof data.notes === 'string' ? data.notes.trim().slice(0, 2000) : application.interviewerNotes,
          roundScore: typeof data.score === 'string' ? data.score.trim().slice(0, 100) : application.roundScore,
        },
      });
      if (changed.count !== 1) throw new ConflictException('The application changed while its stage was being advanced. Refresh and retry.');
      return this.prisma.placementApplication.findUniqueOrThrow({ where: { id: appId } });
    }

    const record = await this.prisma.workflowRequest.findFirst({ where: { id: appId, workflowType: 'PLACEMENT_APPLICATION' } });
    if (!record) throw new NotFoundException('Application record not found.');
    if (!data?.nextStage?.trim() || !data?.nextStatus?.trim()) {
      throw new BadRequestException('A next stage and status are required.');
    }

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

    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id: appId, workflowType: 'PLACEMENT_APPLICATION', status: record.status, updatedAt: record.updatedAt },
      data: {
        currentStage: updatedDetails.stage,
        status: updatedDetails.status,
        details: updatedDetails,
        approvalNotes: data.notes || record.approvalNotes,
      },
    });
    if (changed.count !== 1) throw new ConflictException('The application changed while its stage was being advanced. Refresh and retry.');
    const updated = await this.prisma.workflowRequest.findFirst({ where: { id: appId, workflowType: 'PLACEMENT_APPLICATION' } });
    if (!updated) throw new NotFoundException('Application record was not found after updating.');
    return { id: updated.id, ...((updated.details as any) || {}), stage: updated.currentStage, status: updated.status };
  }

  async getPlacementOffers(user: any) {
    const role = String(user?.role || '').toLowerCase();
    const studentRoll = user?.student?.rollNumber || user?.identifier;
    const records = await this.prisma.workflowRequest.findMany({
      where: {
        workflowType: 'PLACEMENT_OFFER',
        ...(role === 'student' ? { requesterId: studentRoll } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => ({ id: record.id, ...((record.details as any) || {}), status: record.status }));
  }

  async releasePlacementOffer(data: { applicationId: string; packageOffered: string; joiningDate: string; validityDeadline: string }, user: any) {
    const persistedApplication = await this.prisma.placementApplication.findUnique({ where: { id: data.applicationId } });
    const legacyApplication = persistedApplication ? null : await this.prisma.workflowRequest.findFirst({
      where: { id: data.applicationId, workflowType: 'PLACEMENT_APPLICATION' },
    });
    const application = persistedApplication || legacyApplication;
    if (!application) throw new NotFoundException('Persisted placement application not found.');
    if (application.status !== 'Selected') {
      throw new BadRequestException('An offer can only be issued to a selected placement applicant.');
    }
    const legacyDetails = legacyApplication ? (legacyApplication.details as any) || {} : {};
    const drive = persistedApplication ? await this.prisma.placementDrive.findUnique({ where: { id: persistedApplication.driveId } }) : null;
    const studentRoll = persistedApplication?.studentRoll || legacyDetails.regNo || legacyDetails.studentRoll;
    const student = studentRoll ? await this.prisma.student.findUnique({ where: { rollNumber: studentRoll } }) : null;
    if (!student) throw new NotFoundException('The selected applicant does not match an enrolled student record.');
    if (!data.packageOffered?.trim() || !data.joiningDate || !data.validityDeadline) {
      throw new BadRequestException('Package, joining date, and offer expiry are required.');
    }
    const offerToken = `OFFER-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
    const details = {
      applicationId: application.id,
      studentName: student.name,
      regNo: student.rollNumber,
      department: student.department,
      company: persistedApplication?.companyName || legacyDetails.company || legacyDetails.companyName || drive?.companyName,
      role: legacyDetails.role || legacyDetails.roleTitle || drive?.roleTitle,
      packageOffered: data.packageOffered.trim(),
      joiningDate: data.joiningDate,
      validityDeadline: data.validityDeadline,
      status: 'Offer Letter Released',
      offerToken,
      issuedAt: new Date().toISOString().split('T')[0],
      issuedBy: user?.name || user?.identifier,
    };

    if (!details.company || !details.role) throw new BadRequestException('The selected application is missing its company or role details.');

    return this.prisma.$transaction(async (tx) => {
      const claimed = persistedApplication
        ? await tx.placementApplication.updateMany({
            where: { id: application.id, status: 'Selected' },
            data: { status: 'Offer Letter Released', currentStage: 'Offer Letter Released' },
          })
        : await tx.workflowRequest.updateMany({
            where: { id: application.id, workflowType: 'PLACEMENT_APPLICATION', status: 'Selected' },
            data: { status: 'Offer Letter Released', currentStage: 'Offer Letter Released' },
          });
      if (claimed.count !== 1) throw new ConflictException('The application changed while the offer was being prepared. Refresh and try again.');
      const record = await tx.workflowRequest.create({
        data: {
          workflowType: 'PLACEMENT_OFFER',
          title: `Offer: ${student.name} (${details.company})`,
          requesterId: student.rollNumber,
          requesterName: student.name,
          requesterRole: 'STUDENT',
          currentStage: 'Offer Letter Released',
          status: 'Offer Letter Released',
          details,
        },
      });
      return { id: record.id, ...details };
    });
  }

  async actionPlacementOffer(offerId: string, action: string, notes?: string, user?: any) {
    const record = await this.prisma.workflowRequest.findFirst({ where: { id: offerId, workflowType: 'PLACEMENT_OFFER' } });
    if (!record) throw new NotFoundException('Offer record not found.');
    const details = (record.details as any) || {};

    const role = String(user?.role || '').toLowerCase();
    const studentRoll = user?.student?.rollNumber || user?.identifier;
    if (role === 'student' && record.requesterId !== studentRoll) throw new ForbiddenException('Students may only respond to their own offers.');
    if (role !== 'student') throw new ForbiddenException('Only the student can accept or decline their offer.');
    if (record.status !== 'Offer Letter Released') throw new BadRequestException(`Offer cannot be changed from ${record.status}.`);
    if (action !== 'ACCEPT_OFFER' && action !== 'DECLINE_OFFER') throw new BadRequestException('Choose accept or decline.');
    const newStatus = action === 'ACCEPT_OFFER' ? 'Offer Accepted' : 'Offer Declined';

    const updatedDetails = {
      ...details,
      status: newStatus,
      decisionNotes: notes || '',
      decisionAt: new Date().toISOString(),
    };

    const updated = await this.prisma.workflowRequest.updateMany({
      where: { id: offerId, workflowType: 'PLACEMENT_OFFER', status: 'Offer Letter Released' },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: updatedDetails,
      },
    });
    if (updated.count !== 1) throw new ConflictException('The offer changed while the response was being recorded. Refresh and try again.');
    const saved = await this.prisma.workflowRequest.findFirst({ where: { id: offerId, workflowType: 'PLACEMENT_OFFER' } });
    if (!saved) throw new NotFoundException('Offer record was not found after updating.');
    return { id: saved.id, ...((saved.details as any) || {}), status: saved.status };
  }

  async applyToDrive(data: { driveId: string; studentId: string }) {
    return this.prisma.$transaction(async (tx) => {
      const [drive, student] = await Promise.all([
        tx.placementDrive.findUnique({ where: { id: data.driveId } }),
        tx.student.findUnique({ where: { id: data.studentId } }),
      ]);
      if (!drive) throw new NotFoundException('Placement drive not found.');
      if (!student) throw new NotFoundException('Your account has no linked student record.');
      if (drive.status !== 'Registration Open') throw new BadRequestException('This placement drive is not accepting applications.');
      if (student.cgpa == null || student.attendance == null) throw new BadRequestException('Your CGPA and attendance must be recorded before eligibility can be verified.');
      const branch = String(student.deptCode || student.department).toUpperCase();
      const branchAllowed = drive.eligibleBranches.some((allowed) => branch === allowed.toUpperCase() || student.department.toUpperCase().includes(allowed.toUpperCase()));
      if (!branchAllowed) throw new BadRequestException('Your department is not eligible for this drive.');
      if (student.cgpa < drive.minCgpa) throw new BadRequestException(`Minimum CGPA requirement is ${drive.minCgpa}.`);
      if (student.attendance < 75) throw new BadRequestException('Minimum attendance requirement is 75%.');

      const application = await tx.placementApplication.create({
        data: {
          driveId: drive.id,
          companyName: drive.companyName,
          studentRoll: student.rollNumber,
          studentName: student.name,
          cgpa: student.cgpa,
          status: 'Applied',
        },
      });
      await tx.placementDrive.update({ where: { id: drive.id }, data: { registeredCount: { increment: 1 } } });
      return application;
    });
  }

  // ==========================================
  // 4. TRANSPORT FLEET, ROUTES, PASSES & LOGISTICS
  // ==========================================
  async getTransportRoutes() {
    let routes = await this.prisma.transportRoute.findMany({ orderBy: { routeNumber: 'asc' } });

    return routes;
  }

  async createTransportRoute(data: any) {
    const routeNumber = String(data?.routeNumber || '').trim();
    const routeName = String(data?.routeName || '').trim();
    const busNumber = String(data?.busNumber || '').trim();
    const driverName = String(data?.driverName || '').trim();
    const driverContact = String(data?.driverContact || '').trim();
    const capacity = Number(data?.totalCapacity);
    const departureTime = String(data?.departureTime || '').trim();
    const stops = data?.stops;
    if (!routeNumber || !routeName || !busNumber || !driverName || !driverContact || !Number.isInteger(capacity) || capacity < 1 || !departureTime || !Array.isArray(stops) || stops.some((stop: unknown) => typeof stop !== 'string' || !stop.trim())) {
      throw new BadRequestException('Route number, name, assigned bus/driver/contact, positive capacity, departure time, and valid stops are required.');
    }
    return this.prisma.transportRoute.create({
      data: {
        routeNumber,
        routeName,
        busNumber,
        driverName,
        driverContact,
        totalCapacity: capacity,
        allocatedCount: 0,
        departureTime,
        stops: stops.map((stop: string) => stop.trim()),
        status: 'Active',
      },
    });
  }

  async updateTransportRouteDisruption(routeId: string, disruptionNotice: string) {
    const notice = String(disruptionNotice || '').trim();
    if (notice.length > 1000) throw new BadRequestException('Disruption notice must be 1000 characters or fewer.');
    const route = await this.prisma.transportRoute.findUnique({ where: { id: routeId } });
    if (!route) throw new NotFoundException('Route not found');
    const changed = await this.prisma.transportRoute.updateMany({
      where: { id: routeId, status: route.status },
      data: { status: notice ? 'Temporary Diversion' : 'Active', disruptionNotice: notice || null },
    });
    if (changed.count !== 1) throw new ConflictException('Route changed concurrently. Refresh and retry.');
    return this.prisma.transportRoute.findUniqueOrThrow({ where: { id: routeId } });
  }

  // --- Fleet Vehicles ---
  async getTransportFleet() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'FLEET_VEHICLE' },
      orderBy: { createdAt: 'desc' },
    });



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createTransportVehicle(data: any, user: any) {
    const busNumber = String(data?.busNumber || '').trim();
    const fleetCode = String(data?.fleetCode || '').trim();
    const type = String(data?.type || '').trim();
    const capacity = Number(data?.capacity);
    const fuelType = String(data?.fuelType || '').trim();
    if (!busNumber || !fleetCode || !type || !Number.isInteger(capacity) || capacity < 1 || !fuelType) {
      throw new BadRequestException('Vehicle number, fleet code, type, positive capacity, and fuel type are required.');
    }
    const details = {
      busNumber,
      fleetCode,
      type,
      capacity,
      allocatedStudents: 0,
      status: 'Available',
      fuelType,
      driver: String(data.driver || '').trim() || null,
      driverPhone: String(data.driverPhone || '').trim() || null,
      routeName: String(data.routeName || '').trim() || null,
      fitnessExpiry: data.fitnessExpiry || null,
      insuranceExpiry: data.insuranceExpiry || null,
      pucExpiry: data.pucExpiry || null,
      permitExpiry: data.permitExpiry || null,
      odometerKm: data.odometerKm == null ? null : Number(data.odometerKm),
      depot: String(data.depot || '').trim() || null,
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
    const allowed = ['Available', 'Active', 'Under Maintenance', 'Out of Service', 'Retired'];
    if (!allowed.includes(status)) throw new BadRequestException('Unsupported vehicle status.');
    const record = await this.prisma.workflowRequest.findFirst({ where: { id, workflowType: 'FLEET_VEHICLE' } });
    if (!record) throw new NotFoundException('Vehicle record not found');
    const prevDetails = (record.details as any) || {};
    const updatedDetails = { ...prevDetails, status };
    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'FLEET_VEHICLE', status: record.status },
      data: {
        status,
        currentStage: status,
        details: updatedDetails,
        approvalNotes: notes || record.approvalNotes,
      },
    });
    if (changed.count !== 1) throw new ConflictException('Vehicle changed concurrently. Refresh and retry.');
    return this.prisma.workflowRequest.findUniqueOrThrow({ where: { id } });
  }

  async updateVehicleCompliance(id: string, compliance: any, user?: any) {
    const record = await this.prisma.workflowRequest.findFirst({ where: { id, workflowType: 'FLEET_VEHICLE' } });
    if (!record) throw new NotFoundException('Vehicle record not found');
    const prevDetails = (record.details as any) || {};
    const dateFields = ['fitnessExpiry', 'insuranceExpiry', 'pucExpiry', 'permitExpiry'];
    for (const field of dateFields) {
      if (compliance[field] != null && (!/^\d{4}-\d{2}-\d{2}$/.test(compliance[field]) || Number.isNaN(Date.parse(compliance[field])))) {
        throw new BadRequestException(`${field} must be a valid YYYY-MM-DD date.`);
      }
    }
    if (compliance.odometerKm != null && (!Number.isFinite(Number(compliance.odometerKm)) || Number(compliance.odometerKm) < 0)) {
      throw new BadRequestException('Odometer value must be a non-negative number.');
    }
    const updatedDetails = {
      ...prevDetails,
      fitnessExpiry: compliance.fitnessExpiry || prevDetails.fitnessExpiry,
      insuranceExpiry: compliance.insuranceExpiry || prevDetails.insuranceExpiry,
      pucExpiry: compliance.pucExpiry || prevDetails.pucExpiry,
      permitExpiry: compliance.permitExpiry || prevDetails.permitExpiry,
      odometerKm: compliance.odometerKm !== undefined ? Number(compliance.odometerKm) : prevDetails.odometerKm,
    };

    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id, workflowType: 'FLEET_VEHICLE', status: record.status },
      data: { details: updatedDetails },
    });
    if (changed.count !== 1) throw new ConflictException('Vehicle changed concurrently. Refresh and retry.');
    return this.prisma.workflowRequest.findUniqueOrThrow({ where: { id } });
  }

  // --- Drivers ---
  async getTransportDrivers() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'TRANSPORT_DRIVER' },
      orderBy: { createdAt: 'desc' },
    });



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async createTransportDriver(data: any, user: any) {
    const name = String(data?.name || '').trim();
    const phone = String(data?.phone || '').trim();
    const licenseNumber = String(data?.licenseNumber || '').trim();
    const licenseExpiry = String(data?.licenseExpiry || '').trim();
    const experienceYears = Number(data?.experienceYears);
    if (!name || !phone || !licenseNumber || !licenseExpiry || !Number.isFinite(Date.parse(licenseExpiry)) || !Number.isInteger(experienceYears) || experienceYears < 0) {
      throw new BadRequestException('Driver name, contact, licence number, valid licence expiry, and experience years are required.');
    }
    const details = {
      name,
      phone,
      emergencyContact: String(data.emergencyContact || '').trim() || null,
      licenseNumber,
      licenseCategory: String(data.licenseCategory || '').trim() || null,
      licenseExpiry,
      experienceYears,
      assignedBus: String(data.assignedBus || '').trim() || null,
      assignedRoute: String(data.assignedRoute || '').trim() || null,
      shift: String(data.shift || '').trim() || null,
      status: 'Active',
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
  async getTransportPasses(studentRoll?: string) {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'BUS_PASS', ...(studentRoll ? { requesterId: studentRoll } : {}) },
      orderBy: { createdAt: 'desc' },
    });



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async allocateStudentTransport(data: any, user: any) {
    const regNo = String(data?.regNo || '').trim();
    const routeId = String(data?.routeId || '').trim();
    const stopName = String(data?.stopName || '').trim();
    const fareAmount = Number(data?.fareAmount);
    if (!regNo || !routeId || !stopName || !Number.isFinite(fareAmount) || fareAmount <= 0) {
      throw new BadRequestException('A valid student, configured route, stop, and fare are required.');
    }
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findFirst({ where: { OR: [{ rollNumber: regNo }, { studentId: regNo }] } });
      if (!student) throw new NotFoundException('Student must exist in the institutional registry before a pass can be allocated.');
      const existing = await tx.workflowRequest.findFirst({
        where: { workflowType: 'BUS_PASS', requesterId: student.rollNumber, status: { in: ['Active & Verified', 'Pending Approval'] } },
      });
      if (existing) throw new ConflictException(`Student ${student.rollNumber} already has an active or pending pass.`);
      const route = await tx.transportRoute.findUnique({ where: { id: routeId } });
      if (!route || route.status !== 'Active') throw new BadRequestException('Select an active configured transport route.');
      const claimedStudent = await tx.student.updateMany({
        where: { id: student.id, transportPassActive: false },
        data: { transportPassActive: true, transportPassRouteId: route.id },
      });
      if (claimedStudent.count !== 1) throw new ConflictException('Student already has a pending or active transport pass.');
      const allocated = await tx.transportRoute.updateMany({
        where: { id: route.id, status: 'Active', allocatedCount: route.allocatedCount, totalCapacity: { gte: route.allocatedCount + 1 } },
        data: { allocatedCount: { increment: 1 } },
      });
      if (allocated.count !== 1) throw new ConflictException('Route capacity was reached or updated concurrently.');

      const status = 'Pending Approval';
      const details = {
        passNumber: `PASS-${new Date().getFullYear()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        studentName: student.name,
        studentId: student.id,
        regNo: student.rollNumber,
        department: student.department,
        semester: student.semester,
        routeId: route.id,
        routeName: route.routeName,
        stopName,
        fareAmount: Math.round(fareAmount * 100) / 100,
        feeStatus: 'Pending Verification',
        status,
        issueDate: new Date().toISOString().split('T')[0],
        qrToken: crypto.randomBytes(32).toString('hex'),
        createdBy: user?.identifier || user?.id,
      };
      const record = await tx.workflowRequest.create({
        data: {
          workflowType: 'BUS_PASS',
          title: `Bus Pass: ${student.name} (${student.rollNumber})`,
          requesterId: student.rollNumber,
          requesterName: student.name,
          requesterRole: 'STUDENT',
          currentStage: status,
          status,
          details,
        },
      });
      return { id: record.id, ...details };
    });
  }

  async actionTransportPass(passId: string, action: string, notes?: string, user?: any) {
    const record = await this.prisma.workflowRequest.findFirst({ where: { id: passId, workflowType: 'BUS_PASS' } });
    if (!record) throw new NotFoundException('Bus pass record not found');
    const details = (record.details as any) || {};

    const transitions: Record<string, Record<string, string>> = {
      'Pending Approval': { REJECT: 'Rejected' },
      'Active & Verified': { SUSPEND: 'Suspended', REVOKE: 'Cancelled' },
      Suspended: { REVOKE: 'Cancelled' },
    };
    if (action === 'APPROVE' && details.feeStatus !== 'Paid & Verified') {
      throw new BadRequestException('Accounts must verify the transport fee before a pass can be approved.');
    }
    if (action === 'APPROVE' && record.status === 'Pending Approval') transitions['Pending Approval'].APPROVE = 'Active & Verified';
    const newStatus = transitions[record.status]?.[action];
    if (!newStatus) throw new BadRequestException(`Cannot apply ${action} to a pass in ${record.status} status.`);

    const updatedDetails = {
      ...details,
      status: newStatus,
      actionNotes: notes?.trim() || '',
      actionBy: user?.name || user?.identifier,
      actionAt: new Date().toISOString(),
    };

    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.workflowRequest.updateMany({
        where: { id: passId, workflowType: 'BUS_PASS', status: record.status },
        data: { status: newStatus, currentStage: newStatus, details: updatedDetails, approvalNotes: notes },
      });
      if (changed.count !== 1) throw new ConflictException('Pass changed concurrently. Refresh and retry.');
      if (['Rejected', 'Cancelled'].includes(newStatus)) {
        if (!details.routeId || !details.studentId) throw new ConflictException('Legacy pass is missing student/route linkage; reconcile it before closing the pass.');
        const routeChanged = await tx.transportRoute.updateMany({
          where: { id: details.routeId, allocatedCount: { gte: 1 } },
          data: { allocatedCount: { decrement: 1 } },
        });
        if (routeChanged.count !== 1) throw new ConflictException('Route allocation counter is inconsistent; reconcile it before changing this pass.');
        const studentChanged = await tx.student.updateMany({
          where: { id: details.studentId, transportPassActive: true, transportPassRouteId: details.routeId },
          data: { transportPassActive: false, transportPassRouteId: null },
        });
        if (studentChanged.count !== 1) throw new ConflictException('Student transport allocation is inconsistent; reconcile it before closing this pass.');
      }
      return tx.workflowRequest.findUniqueOrThrow({ where: { id: passId } });
    });
  }

  // --- Daily Trip Operations ---
  async getTransportTrips() {
    const records = await this.prisma.workflowRequest.findMany({
      where: { workflowType: 'TRIP_DISPATCH' },
      orderBy: { createdAt: 'desc' },
    });



    return records.map(r => ({
      id: r.id,
      ...((r.details as any) || {}),
      status: r.status,
    }));
  }

  async actionTransportTrip(tripId: string, action: string, data?: any, user?: any) {
    const record = await this.prisma.workflowRequest.findFirst({ where: { id: tripId, workflowType: 'TRIP_DISPATCH' } });
    if (!record) throw new NotFoundException('Trip record not found');
    const details = (record.details as any) || {};

    let newStatus = record.status;
    let actualDeparture = details.actualDeparture;
    let actualArrival = details.actualArrival;
    let delayMinutes = details.delayMinutes || 0;
    let incidentReport = details.incidentReport || null;
    const nowStr = new Date().toISOString();

    if (action === 'START_TRIP') {
      if (!['Scheduled', 'Ready', 'Delayed'].includes(record.status)) throw new BadRequestException(`Cannot start a trip in ${record.status} status.`);
      newStatus = 'In Transit';
      actualDeparture = nowStr;
    } else if (action === 'COMPLETE_TRIP') {
      if (!['In Transit', 'Delayed'].includes(record.status)) throw new BadRequestException(`Cannot complete a trip in ${record.status} status.`);
      newStatus = 'Completed';
      actualArrival = nowStr;
    } else if (action === 'RECORD_DELAY') {
      if (!['Scheduled', 'In Transit'].includes(record.status)) throw new BadRequestException(`Cannot record a delay in ${record.status} status.`);
      const reason = String(data?.reason || '').trim();
      const minutes = Number(data?.delayMinutes);
      if (!reason || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) throw new BadRequestException('A delay reason and delay duration from 1 to 1440 minutes are required.');
      newStatus = 'Delayed';
      delayMinutes = minutes;
      incidentReport = reason;
    } else if (action === 'REPORT_BREAKDOWN') {
      if (!['Scheduled', 'In Transit', 'Delayed'].includes(record.status)) throw new BadRequestException(`Cannot report a breakdown in ${record.status} status.`);
      const reason = String(data?.notes || data?.reason || '').trim();
      if (reason.length < 3 || reason.length > 1000) throw new BadRequestException('Describe the breakdown in 3 to 1000 characters.');
      newStatus = 'Breakdown / Halted';
      incidentReport = reason;
    } else {
      throw new BadRequestException('Unsupported trip operation.');
    }

    const updatedDetails = {
      ...details,
      status: newStatus,
      actualDeparture,
      actualArrival,
      delayMinutes,
      incidentReport,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.identifier || user?.id,
    };

    const changed = await this.prisma.workflowRequest.updateMany({
      where: { id: tripId, workflowType: 'TRIP_DISPATCH', status: record.status },
      data: {
        status: newStatus,
        currentStage: newStatus,
        details: updatedDetails,
      },
    });
    if (changed.count !== 1) throw new ConflictException('Trip changed concurrently. Refresh and retry.');
    return this.prisma.workflowRequest.findUniqueOrThrow({ where: { id: tripId } });
  }

  // --- GPS Telemetry & Safety Freshness ---
  async getTransportTelemetry(): Promise<never> {
    throw new ServiceUnavailableException('GPS telemetry is unavailable until a provider is configured.');
  }

  // --- Transport Dashboard Stats ---
  async getTransportDashboardStats() {
    const fleet = await this.getTransportFleet();
    const routes = await this.getTransportRoutes();
    const passes = await this.getTransportPasses();
    const trips = await this.getTransportTrips();
    let telemetry: any[] = [];
    let telemetryConfigured = false;
    try {
      telemetry = await this.getTransportTelemetry();
      telemetryConfigured = true;
    } catch {
      // The campus has no configured GPS telemetry provider yet.
    }

    const totalFleet = fleet.length;
    const operationalVehicles = fleet.filter(v => (v.status || '').includes('Active') || (v.status || '').includes('Available')).length;
    const underMaintenance = fleet.filter(v => (v.status || '').includes('Maintenance') || (v.status || '').includes('Out of Service')).length;
    const totalRoutes = routes.length;

    const totalCapacity = fleet.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
    const activePassHolders = passes.filter(p => (p.status || '').includes('Active')).length;
    const pendingPasses = passes.filter(p => (p.status || '').includes('Pending')).length;

    const seatUtilization = totalCapacity > 0 ? Math.round((activePassHolders / totalCapacity) * 100) : null;

    const now = Date.now();
    const ninetyDaysFromNow = now + 90 * 24 * 60 * 60 * 1000;
    const upcomingExpiries = fleet.filter(v => {
      return [v.fitnessExpiry, v.insuranceExpiry, v.pucExpiry, v.permitExpiry].some((value) => {
        if (typeof value !== 'string') return false;
        const expiry = new Date(value).getTime();
        return !Number.isNaN(expiry) && expiry >= now && expiry <= ninetyDaysFromNow;
      });
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
      liveTelemetryCount: telemetryConfigured ? liveTelemetryCount : null,
      telemetryConfigured,
      inTransitTrips,
      totalTripsToday: null,
      totalTripRecords: trips.length,
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
    const totalEquipment = equipment.length;
    const operationalEquipment = equipment.filter(e => e.condition === 'Operational').length;

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
      : null;

    return {
      openTicketsCount: openTickets.length,
      overdueTicketsCount: overdueTickets.length,
      criticalIncidentsCount: criticalIncidents.length,
      checkedInVisitorsCount: checkedInVisitors.length,
      expectedVisitorsTodayCount: expectedToday.length,
      totalLaboratories: null,
      operationalLaboratories: null,
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

  async updateWorkflowStage(id: string, action: 'APPROVE' | 'REJECT' | 'RETURN', approver: { id: string; name: string; role: string }, notes?: string) {
    const req = await this.prisma.workflowRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Workflow request not found.');

    const newStatus = action === 'APPROVE' ? 'Approved' : action === 'RETURN' ? 'Returned for Revision' : 'Rejected';
    const actionLabel = action === 'APPROVE' ? 'APPROVED' : action === 'RETURN' ? 'RETURNED_FOR_REVISION' : 'REJECTED';
    const history = (req.history as any[]) || [];
    history.push({
      stage: req.currentStage,
      action: actionLabel,
      by: approver.name,
      role: approver.role,
      notes,
      timestamp: new Date().toISOString(),
    });

    const updated = await this.prisma.workflowRequest.update({
      where: { id },
      data: {
        status: newStatus,
        approverId: approver.id,
        approverName: approver.name,
        approvalNotes: notes,
        history,
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          user: approver.name || 'System Approver',
          role: approver.role || 'approver',
          subject: req.title,
          assessment: 'Workflow Decision',
          oldMark: req.status,
          newMark: newStatus,
          changedAt: new Date().toLocaleString('en-IN'),
          reason: notes || `Workflow action: ${actionLabel}`,
        },
      });
    } catch {}

    return updated;
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
