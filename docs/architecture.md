# College Management System Architecture

> **Current implementation note (2026-10-21):** The canonical persistence target is MongoDB Atlas through Prisma. The schema in [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) is authoritative. This file contains older conceptual ER descriptions and role assumptions; do not treat those as the current database schema or permission contract. MongoDB relations are emulated by Prisma and do not create relational foreign keys. The divergent root `prisma/schema.prisma` and committed SQL migrations are legacy artifacts.

## 1. Complete feature list

### Core modules
- Student lifecycle management
- Faculty and staff management
- Academic planning and semester management
- Attendance tracking and alerts
- Internal assessment and results
- University mark sheet generation
- Fee collection and payment lifecycle
- Document management with approval workflow
- Guardian and address records
- Library circulation and fines
- Placements, internships, and career support
- Online examination engine
- Feedback and surveys
- Health records and secure access controls
- Digital ID card and biometric abstraction layer
- Canteen access verification
- Notifications, notices, and calendar management
- Admin reporting and audit trails

### User-facing capabilities
- Role-based protected dashboards
- Global search and command palette
- Responsive application shell
- Customizable dashboard widgets
- Audit logging for admin actions
- Secure document upload and storage
- PDF export and report generation
- Advanced filterable tables
- Bulk operations and CSV/Excel exports
- Real-time notification center

## 2. User roles and permissions matrix

| Role | Primary access | Key restrictions |
|---|---|---|
| Super Admin | Full system configuration, all modules, audit access | No direct user-data exposure outside authorized scopes |
| College Admin | Student/faculty records, examinations, fee, reports | Cannot alter protected health or payment gateway credentials |
| Faculty | Assigned subjects, attendance, marks, class records | Cannot edit fee or student private documents |
| Mentor | Assigned student academic progress and advisories | Limited to mentor cohort |
| Student | Own profile, academics, attendance, fees, library, placement, notices | Cannot view other students' records |
| Accounts Staff | Fees, payment registers, refund workflow | Cannot modify academic marks |
| Examination Staff | Exam setup, results, marks verification | No payment/hostel access |
| Placement Officer | Placement records, job postings, interview workflow | No fee or result authoring |
| Librarian | Book catalog, issue/return, fines | No academic marks access |
| Hostel Staff | Room allocation, hostel records, access logs | No academic records |
| Transport Staff | Routes, transport records, student commute data | No fee or exam access |

### Permission examples
- `student:read:self`
- `student:write:own`
- `marks:read:assigned_students`
- `marks:write:course_scope`
- `fees:read:all`
- `fees:write:accounts_only`
- `document:verify:admin`
- `audit:read:admin`

## 3. Database ER diagram description

The current MongoDB model uses collections with references represented by CUID string fields. Prisma emulates relation behavior at the client layer; service validation and indexes are required to protect related data.

Core hierarchy:
- User -> Role
- User -> Student | Faculty
- Student -> Guardian, Address, Document, HealthRecord, IdCard, Payment, Attendance, InternalMark, UniversityResult
- Course -> Branch -> Batch -> Section -> Semester -> Subject
- Subject is mapped through Enrollment/Academic records
- Notice, CalendarEvent, Holiday, Notification are cross-entity informational modules
- LibraryBook and LibraryTransaction track circulation
- Internship and Job business flows connect to Student and PlacementCompany
- Exam -> Question -> ExamAttempt
- AuditLog records actions made by users

## 4. Database schema

The current MongoDB schema is implemented in Prisma in [backend/prisma/schema.prisma](../backend/prisma/schema.prisma).

Key tables:
- `User`
- `Role`
- `Permission`
- `Student`
- `Faculty`
- `Department`
- `Course`
- `Branch`
- `Batch`
- `Section`
- `Semester`
- `Subject`
- `Attendance`
- `InternalMark`
- `UniversityResult`
- `Fee`
- `Payment`
- `Guardian`
- `Address`
- `Document`
- `Notice`
- `CalendarEvent`
- `Holiday`
- `LibraryBook`
- `LibraryTransaction`
- `Internship`
- `PlacementCompany`
- `Job`
- `JobApplication`
- `Exam`
- `Question`
- `ExamAttempt`
- `Feedback`
- `HealthRecord`
- `IdCard`
- `BiometricRecord`
- `CanteenTransaction`
- `Notification`
- `AuditLog`

Design decisions:
- UUID or CUID primary keys
- soft delete pattern where needed
- timestamps for all mutable records
- unique constraints for identity and business keys
- indexed lookup keys on `studentId`, `userId`, `semesterId`, and `subjectId`

## 5. API architecture

### REST groupings
- `/api/auth` — login, refresh, logout, password reset, profile
- `/api/users` — user records and account activation
- `/api/students` — student profile management
- `/api/faculty` — faculty profiles and assignment management
- `/api/academics` — subjects, semesters, timetable, course data
- `/api/attendance` — attendance records and low-attendance alerts
- `/api/marks` — internal marks and analytics
- `/api/results` — university marksheets and SGPA/CGPA
- `/api/fees` — fee categories, dues, payment records
- `/api/documents` — secure upload, verify, preview, approval
- `/api/library` — issue, return, due fines
- `/api/internships` — internship tracking
- `/api/placements` — company listings and applications
- `/api/exams` — online exam management and attempts
- `/api/notifications` — centralized notifications
- `/api/reports` — PDF/Excel/CSV exports
- `/api/admin` — dashboards and system reports

### Security layer
- JWT access token + refresh token model
- role validation middleware
- per-route authorization checks
- input validation with Zod
- rate limiting and request quotas
- secure file storage references only, not raw file paths
- centralized error formatter

## 6. Frontend route structure

- `/login`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/dashboard/student`
- `/dashboard/admin`
- `/students`
- `/students/:id`
- `/academics`
- `/attendance`
- `/marks`
- `/results`
- `/fees`
- `/documents`
- `/library`
- `/internships`
- `/placements`
- `/exams`
- `/notices`
- `/calendar`
- `/notifications`
- `/feedback`
- `/reports`
- `/settings`

## 7. Component architecture

### Layout components
- AppShell
- SidebarNavigation
- TopBar
- Breadcrumbs
- PageHeader
- MobileNav

### Reusable UI
- Card
- StatBlock
- Badge
- Tabs
- DataTable
- SearchInput
- FilterToolbar
- Modal
- Drawer
- FormSection
- EmptyState
- ErrorState

### Domain modules
- StudentSummaryCard
- AttendanceOverviewChart
- FeeSummaryPanel
- InternalMarksChart
- ResultCard
- NoticeList
- CalendarGrid
- LibraryLoanWidget
- PlacementOpportunityCard

## 8. Design system

### Design tokens
- Background: slate-50 / white
- Surface: white, soft gray, transparent glass overlays
- Accent: blue and indigo with secondary teal accents
- Typography: Inter-like professional sans-serif stack
- Radius: 12-20px cards, 10px controls
- Borders: subtle gray-200/gray-300
- Shadows: soft, low-contrast layered shadows

### UX principles
- Minimal, data-first dashboard design
- Responsive cards and collapsible navigation
- Accessible color contrast and focus states
- Skeleton loading and error fallbacks
- Keyboard support, including Ctrl+K global search
- Dark mode support through a system-aware theme layer

## 9. Dashboard wireframe description

### Student dashboard
- Top row: welcome banner, current CGPA, attendance, pending fees, next exam
- Analytics row: subject performance chart, attendance trend chart, fee payment progress
- Secondary row: upcoming notices, assignments, internships, library summary
- Right rail: calendar, birthdays, quick actions, urgent notifications

### Admin dashboard
- KPI cards for students, faculty, attendance, fees, active internships, placement offers
- Trend charts for enrollment, attendance, fee collection
- Recent activity feed and alerts panel
- Table of latest admissions, overdue fees, and exam scheduling

## 10. Development roadmap

### Phase 1 — foundation
- Project architecture
- Auth system
- Database schema and RBAC
- Design tokens and shell

### Phase 2 — student lifecycle
- Dashboard
- Profile pages
- Academic overview

### Phase 3 — assessment
- Attendance, internal marks, university results

### Phase 4 — finance and docs
- Fees, payments, document workflows

### Phase 5 — campus services
- Library, internship, placement

### Phase 6 — communication and exams
- Notices, calendar, online exams, feedback

### Phase 7 — administration
- Admin dashboards, reporting, audit logs

### Phase 8 — hardening
- Security, testing, performance, deployment

## 11. Implementation status

This repository currently contains the Phase 1 foundation:
- modern Vite/React frontend shell
- Express API scaffold
- JWT-based auth and RBAC module
- Prisma MongoDB schema and indexes
- initial design system and dashboard layout
- unit tests for role permission logic
