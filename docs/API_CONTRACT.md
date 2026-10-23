# CollegeFlow — API Contract Specification

This document defines the RESTful API endpoints for the **Digital Fee Payment Proof & Verification** module and **Class Notes Sharing / Missed Class** module.

---

## Module 1: Digital Fee Payment Proof & Verification

### 1. GET `/api/fees/statement`
The endpoint currently returns `503 Service Unavailable` until official student fee assessments and due dates exist in the data model. It does not return sample financial figures.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: linked `Student`, `Accounts`, `Admin`, `Super Admin`, `Management`, `Principal`
- **Query Params**: `rollNumber` (required for staff; students may omit it and can only address their linked record)
- **Response**: `503` while fee assessments/due dates are unconfigured; `403` for an unlinked or unauthorized identity.

### 2. GET `/api/fees/payment-proofs`
List payment proof submissions belonging to the authenticated, linked student. The query is scoped by the student ID from the JWT; the response omits file bytes and internal student identifiers. Returns `{ "success": true, "count": number, "data": [...] }` with review status and attachment availability.

### 3. GET `/api/fees/payment-verifications/:id/proof`
Fetch the original attachment. A Student JWT is restricted to its linked student's proof; Accounts, Admin, or Super Admin can fetch a proof for review. The service returns `404` if the proof does not exist or is outside the requesting student's ownership scope.

Financial dashboards return `null` for assessed totals, dues, collection rates, and other metrics that do not have canonical persisted data. Empty payment, transaction, structure, scholarship, and document collections return empty lists; GET requests do not seed demo records.

### 4. POST `/api/fees/payment-proof`
Submit a new digital payment proof (screenshot/PDF) for accounts verification.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`
- **Content-Type**: `application/json` with a Base64 data URI. Uploads are limited to 5 MB and accepted only for JPG, PNG, WEBP, or PDF content whose signature matches the declared MIME type.
- **Request Body**:
```json
{
  "amount": 12000,
  "paymentDate": "2026-10-05",
  "paymentMethod": "UPI",
  "transactionId": "UPI9823471029",
  "referenceNumber": "REF-2026-9812",
  "remarks": "Paid via PhonePe for Sem 7",
  "fileData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "fileName": "payment_receipt.png",
  "fileType": "image/png"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Payment proof submitted for Accounts review.",
  "data": {
    "id": "<deterministic-payment-proof-id>",
    "status": "PENDING",
    "submittedAt": "2026-10-05T10:30:00Z"
  }
}
```
- The authenticated Student profile supplies the student ID, name, roll number, department, and semester. Client-supplied identity fields are discarded.
- Each proof uses a deterministic database ID derived from its transaction ID, preventing a duplicate transaction ID from creating another proof under concurrent submissions. Metadata and the private file record are created together.
- **Error Responses**: `400` for invalid fields/file payload, `403` for an unlinked or unauthorized account, `409` for a duplicate transaction ID, and `413` when the JSON upload exceeds the route body limit.

---

### 5. GET `/api/fees/payment-verifications`
Fetch pending and processed payment proofs submitted by students for Accounts section review.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`, `Super Admin`
- **Query Params**: `status` (`PENDING`, `APPROVED`, `REJECTED`, `ALL`), `search`
- **Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": "<payment-proof-id>",
      "studentName": "<database-student-name>",
      "rollNumber": "<database-roll-number>",
      "department": "<database-department>",
      "amount": 0,
      "paymentDate": "<payment-date>",
      "paymentMethod": "UPI",
      "transactionId": "<transaction-id>",
      "referenceNumber": null,
      "proofAvailable": true,
      "status": "PENDING",
      "remarks": "<remarks>",
      "submittedAt": "<iso-timestamp>"
    }
  ]
}
```

The list omits file bytes and private internal student identifiers and does not claim OCR/bank validation. Accounts can fetch a selected attachment from `GET /api/fees/payment-verifications/:id/proof`.

---

### 6. POST `/api/fees/payment-verifications/:id/approve`
Approve a pending proof and create its verified `FeeTransaction` ledger row.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`, `Super Admin`
- **URL Params**: `id` (Payment Proof ID)
- The proof state transition and ledger insert run in one MongoDB transaction. The proof is conditionally changed from `PENDING`; a second or concurrent review receives `409` and cannot create another ledger entry. This requires a MongoDB replica set (Atlas clusters provide one); runtime behavior still needs a live safe-database integration check.
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Payment proof verified and posted to the fee transaction ledger.",
  "data": {
    "id": "<payment-proof-id>",
    "status": "APPROVED",
    "verifiedBy": "<authenticated-reviewer-name>",
    "verifiedAt": "<iso-timestamp>",
    "receiptNo": "RCPT-2026-<generated-uuid>"
  },
  "transaction": { "id": "<database-id>", "receiptNo": "RCPT-2026-<generated-uuid>" }
}
```

---

### 7. POST `/api/fees/payment-verifications/:id/reject`
Reject a student payment proof with a mandatory rejection reason.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`, `Super Admin`
- **URL Params**: `id` (Payment Proof ID)
- **Request Body**:
```json
{
  "rejectionReason": "Transaction ID could not be verified in bank statement."
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Payment proof rejected with the supplied reason.",
  "data": {
    "id": "PAY-1001",
    "status": "REJECTED",
    "rejectionReason": "Transaction ID could not be verified in bank statement."
  }
}
```

The transition only succeeds from `PENDING`; another review returns `409`. Student notification delivery is not configured, so rejection records a reason but does not claim that an email or message was sent.

### 8. POST `/api/fees/record`

Accounts/Admin/Super Admin can record a counter receipt for funds they have independently confirmed. The request requires a UUID `idempotencyKey`, `rollNumber`, `semester`, `head`, positive `amount`, and supported `mode`. The backend resolves the student name from Atlas, creates a server-generated unique receipt number, and writes the ledger row with an idempotency record in one transaction. Repeating the same key and payload returns the original ledger row; using that key for different details returns `409`. A receipt records the collection; it does not calculate or clear an assessed student balance.

### Fee structures and scholarship sanctions

`GET/POST /api/fees/structures` reads and creates persisted `FeeStructure` rows. The server calculates `total` from the submitted fee components and rejects a second structure for the same normalized program and term. `POST /api/fees/scholarships` requires an existing student roll number and explicit award details; student identity and initial `disbursedAmount` are resolved/set by the server. Awarding a scholarship does not count it as disbursed.

---

## Module 2: Class Notes Sharing & Missed Classes

### 1. GET `/api/class-notes`
Fetch uploaded class notes with filtering by date, subject, semester, section, and search query.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`, `Faculty`, `Admin`
- **Query Params**: `subject`, `date`, `semester`, `section`, `search`
- **Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": "NOTE-501",
      "subject": "Operating Systems",
      "date": "2026-10-05",
      "topic": "Process Scheduling Algorithms (Round Robin & SJF)",
      "description": "Comprehensive handwritten class notes with solved numericals.",
      "uploadedBy": {
        "name": "Rohan Sharma",
        "rollNumber": "2305201012"
      },
      "uploadedAt": "2026-10-05T14:30:00Z",
      "fileUrl": "data:image/svg+xml...",
      "fileName": "OS_Process_Scheduling.pdf",
      "fileType": "pdf",
      "status": "VISIBLE",
      "isFacultyVerified": true,
      "reportCount": 0,
      "duplicateCount": 3
    }
  ]
}
```

---

### 2. POST `/api/class-notes`
Upload student-generated class notes for a missed lecture.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`, `Faculty`
- **Request Body**:
```json
{
  "subject": "Operating Systems",
  "date": "2026-10-05",
  "topic": "Process Scheduling",
  "description": "Class notes & board photos from today's lecture.",
  "file": "data:image/jpeg;base64,...",
  "fileName": "lecture_notes.jpg",
  "fileType": "image/jpeg"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Class notes uploaded successfully.",
  "data": {
    "id": "NOTE-502",
    "status": "VISIBLE",
    "isFacultyVerified": false
  }
}
```

---

### 3. POST `/api/class-notes/:id/report`
Report inaccurate, blurry, or inappropriate student notes.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`, `Faculty`
- **URL Params**: `id`
- **Request Body**:
```json
{
  "reason": "Wrong information",
  "description": "The formula on page 2 for SJF waiting time is incorrect."
}
```
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Report submitted for faculty review."
}
```

---

### 4. GET `/api/class-notes/missed-classes`
Fetch missed classes for the logged-in student along with available notes indicator.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`
- **Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ABSENT-101",
      "date": "2026-10-05",
      "subject": "Operating Systems",
      "period": "09:15 AM - 10:15 AM",
      "status": "Absent",
      "notesAvailable": true,
      "notesCount": 3,
      "topic": "Process Scheduling"
    },
    {
      "id": "ABSENT-102",
      "date": "2026-10-04",
      "subject": "Data Structures",
      "period": "11:15 AM - 12:15 PM",
      "status": "Absent",
      "notesAvailable": false,
      "notesCount": 0,
      "topic": "Binary Search Tree"
    }
  ]
}
```

---

### 5. POST `/api/faculty/class-notes/:id/verify`
Faculty mark student-uploaded notes as official `✓ Faculty Verified`.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Faculty`, `Admin`
- **URL Params**: `id`
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Notes verified by faculty."
}
```

---

## Admin AI model metadata

### GET `/api/admin/ai-metrics`

Returns the evaluation metadata exposed by the configured FastAPI service at `${AI_SERVICE_URL}/metrics`.

- **Authentication**: Bearer token
- **Allowed roles**: `SUPER_ADMIN`, `MANAGEMENT`, `PRINCIPAL`, `ADMIN`
- **Unavailable service**: returns `503 Service Unavailable`; the UI must not replace it with fabricated scores.
- **Response**: `{ "success": true, "data": { ...model metadata... } }`. The metadata includes training provenance and may include a notice that the evaluation dataset is synthetic.

---

## Identity and account-safety contracts

### GET `/api/students/profile`

Requires a JWT whose account is linked to a `Student`. Returns only that linked student's profile. A non-student role receives `403`; an unlinked or missing profile returns `404`. The endpoint does not accept a client-supplied student ID or fall back to a default roll number.

### POST `/api/students/transfer-preference`

Requires a JWT linked to a student and a body containing `campus`, `city`, and `confirmed: true`. The server derives the student ID from the JWT relation before updating the preference.

### POST `/api/admin/users/create`

Requires an Admin or Super Admin JWT. The body requires `name`, `email`, `identifier`, a valid role, and an initial password of at least 12 characters. A Super Admin may provision any role, including another Super Admin; an Admin may provision only roles below Admin in the server-enforced role hierarchy. The response omits the password hash.

### POST `/api/admin/users/:id/status`

Requires an Admin or Super Admin JWT. The service rechecks the target role and permits status changes only when the actor outranks the target. Equal/higher-role accounts and self-status changes are rejected with `403`; updates use a compare-and-set write and record the change in the audit log in the same transaction. No API endpoint changes an existing user's role.

### POST `/api/auth/forgot-password` and POST `/api/admin/users/:id/reset-password`

Return `503 Service Unavailable` until secure email delivery is configured. These endpoints do not mint or return a reset token.

### POST `/api/chatbot/query`

Requires a Bearer JWT. The chatbot uses the authenticated request identity; a `user` field supplied in the request body is ignored.

### POST `/api/admission/applicants/:id/approve`

Enrollment creates the student, enrollment, and inactive student account records. The response does not contain the activation token. Until an email delivery provider is configured, `activationStatus` is `PENDING_EMAIL_CONFIGURATION` and the student cannot activate the account through the portal.

## Examination API status

- `GET/POST /api/exams/cycles` and `POST /api/exams/cycles/:id/transition` use persisted `WorkflowRequest` records. Creation requires title, session, start date, and end date. The requester and transition reviewer are derived from the JWT. Cycle states advance sequentially from `Draft` through `Closed`; skipped transitions return `400`, a missing cycle returns `404`, and a concurrent transition returns `409` so the client can refresh. The Exam Cell cycle list/create/advance UI now uses these endpoints and displays server errors without writing a local success fallback.
- Candidate counts and paper counts are not stored on an exam cycle and are not reported as live values. Cycle deletion is not implemented.
- `GET /api/exams/moderation/:subjectCode` reads actual `AssessmentMark` rows for an existing subject.
- `GET /api/exams/circulars` returns exam-tagged persisted notices.
- Dashboard counts expose only supported database-backed measures; unsupported metrics are `null` and listed in `unavailableMetrics`.
- Timetable, seating, hall-ticket, certified-grade, and re-evaluation endpoints return `503` because the canonical schema has no persistence models for those workflows yet. These operations do not return demo rows or fabricated success.

## Marks and HOD moderation

- `GET /api/marks/student` uses the linked student database ID for Student JWTs. A student cannot choose another roll number; missing profiles return `404` and unknown marks return an empty list.
- `GET /api/marks/section/:subjectCode` and faculty mark edits are checked against faculty subject-section assignments. HOD reads and review actions are limited to the authenticated HOD's assigned department.
- `PUT /api/marks/cell` only accepts the known assessment fields. Scores are validated against the current components used by the calculation service: modular tests 0–20, quizzes/assignments/surprise tests/lab work 0–10. Requests require exactly one student ID or roll number.
- `GET /api/marks/approval-queue` and `GET /api/hod/approval-queue` read persisted approval records. Approve/reject only operate on `Pending` records; rejection and reopen actions require a reason. Reopen sets status to `Returned`, allowing faculty corrections and a subsequent new submission.

## Faculty attendance

- `GET /api/faculty/attendance/roster?subjectCode=CS501&section=Section%20A` and `GET /api/faculty/attendance/sessions?subjectCode=CS501&section=Section%20A` require a JWT linked to a Faculty profile and are limited to that faculty member's assigned subject section.
- `POST /api/faculty/attendance/submit` accepts `subjectCode`, `section`, `date` (`YYYY-MM-DD`), `period`, and `attendanceMap` keyed by roll number with boolean values. The submitted keys must match the complete active database roster for the assigned semester, section, and academic year. Subject name, faculty identity, student names, totals, and percentage are derived on the server.
- Each finalized session stores its roster entries and summary in `AttendanceSession`; a unique subject-section-date-period key prevents duplicate records. Session creation and its `AuditLog` entry use one MongoDB transaction. Existing aggregate `AttendanceRecord` percentages are not updated by this endpoint.

## Hostel residence and maintenance

- `GET /api/hostel/my-residence` uses the linked student identity for Student JWTs. Students cannot select a different roll number. Staff lookups require hostel, warden, admin, management, principal, or super-admin roles.
- `GET /api/hostel/list`, `/rooms`, and `/dashboard-stats` require an authorized hostel staff role. Capacity summaries derive from `HostelRoom.capacity` and `HostelRoom.occupied`; legacy `Hostel` summary counters may be stale.
- `POST /api/hostel/allocate`, `/transfer`, and `/vacate` require Hostel, Warden, Admin, or Super Admin. Allocation uses the database room record, a deterministic active-bed claim, a capacity compare-and-set, and a student allocation compare-and-set in one transaction. A missing/full room, occupied bed, concurrent write, or stale student allocation returns a conflict/not-found response without a successful allocation.
- `GET /api/hostel/complaints` scopes Student requests to the linked student's roll and Staff requests to tickets assigned to the authenticated staff user. Only authorized hostel staff and management roles can read the broader queue.
- `POST /api/hostel/complaints` requires a linked Student with a persisted hostel room. Student name, roll, student ID, hostel, and room come from that record; client identity fields are not accepted. The request supports a title or image for classification, a category from the supported taxonomy, and optional location text. Image analysis payloads are limited to 5 MB raw image size.
- `PATCH /api/hostel/complaints/:id/status` accepts only known complaint states and valid lifecycle transitions. Staff accounts must map to exactly one `StaffRoster` entry and may update only tickets assigned to that roster ID; they can only mark their ticket In Progress or Resolved. Reassignment uses an active `StaffRoster` ID, not a client-supplied display name. Concurrent status changes return `409`.
- `GET /api/hostel/gate-passes` returns only the requesting student's records for a Student JWT; authorized hostel staff can read the queue. `POST /api/hostel/gate-passes` derives the student and room from the JWT-linked Student record and accepts purpose, destination, future ISO 8601 departure/return times, and optional emergency contact. Parent/mentor verification remains unset until a real verification flow exists. Actions advance Pending Warden Approval → Approved or Rejected; only Approved passes can move to Exited and only Exited passes can move to Returned. Each transition uses compare-and-set protection and records the authenticated actor.
- `GET /api/hostel/documents` scopes Student reads to their linked account; hostel staff roles may read the queue. Both the student Gate Pass form and warden HostelPortal queue use the backend list/create/action endpoints. This workflow has unit coverage but has not been exercised against Atlas.

---
