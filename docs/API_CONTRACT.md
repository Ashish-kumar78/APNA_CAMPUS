# CollegeFlow — API Contract Specification

This document defines the RESTful API endpoints for the **Digital Fee Payment Proof & Verification**, **Class Notes Sharing**, and **Student Quiz & Marks** modules.

---

## Module 1: Digital Fee Payment Proof & Verification

### 1. GET `/api/fees/statement`
Fetch fee summary, dues breakdown, scholarship info, and fee payment proof history for the authenticated student.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`, `Accounts`, `Admin`
- **Query Params**: `rollNumber` (optional for Accounts/Admin, defaults to logged-in user)
- **Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "studentName": "Rakesh Das",
    "rollNumber": "2305201001",
    "department": "Computer Science & Engineering",
    "semester": "Semester 7",
    "totalFee": 89000,
    "scholarship": 15000,
    "paidAmount": 62000,
    "pendingAmount": 12000,
    "currentStatus": "PENDING_VERIFICATION",
    "paymentHistory": [
      {
        "id": "PAY-1001",
        "date": "2026-10-05",
        "amount": 12000,
        "paymentMethod": "UPI",
        "transactionId": "UPI9823471029",
        "referenceNumber": "REF-2026-9812",
        "proofUrl": "data:image/svg+xml;utf8,...",
        "status": "PENDING",
        "remarks": "Paid via Google Pay",
        "rejectionReason": null
      }
    ]
  }
}
```

---

### 2. POST `/api/fees/payment-proof`
Submit a new digital payment proof (screenshot/PDF) for accounts verification.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Student`
- **Content-Type**: `multipart/form-data` or `application/json` (Base64 file payload)
- **Request Body**:
```json
{
  "amount": 12000,
  "paymentDate": "2026-10-05",
  "paymentMethod": "UPI",
  "transactionId": "UPI9823471029",
  "referenceNumber": "REF-2026-9812",
  "remarks": "Paid via PhonePe for Sem 7",
  "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "fileName": "payment_receipt.png",
  "fileType": "image/png"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Payment proof submitted successfully for verification.",
  "data": {
    "id": "PAY-1002",
    "status": "PENDING",
    "submittedAt": "2026-10-05T10:30:00Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: `{ "success": false, "message": "Transaction ID is required." }`
  - `400 Bad Request`: `{ "success": false, "message": "Invalid file type. Supported: JPG, PNG, WEBP, PDF." }`
  - `413 Payload Too Large`: `{ "success": false, "message": "File size exceeds 5MB limit." }`

---

### 3. GET `/api/accounts/payment-verifications`
Fetch pending and processed payment proofs submitted by students for Accounts section review.

- **Method**: `GET`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`
- **Query Params**: `status` (`PENDING`, `APPROVED`, `REJECTED`, `ALL`), `search`
- **Response 200 OK**:
```json
{
  "success": true,
  "data": [
    {
      "id": "PAY-1001",
      "studentName": "Ashish Kumar",
      "rollNumber": "2305201037",
      "department": "CSE",
      "amount": 20000,
      "paymentDate": "2026-10-05",
      "paymentMethod": "UPI",
      "transactionId": "UPI-88492019",
      "referenceNumber": "REF-9921",
      "proofUrl": "data:image/svg+xml...",
      "status": "PENDING",
      "remarks": "Fees for Semester 5",
      "submittedAt": "2026-10-05T09:15:00Z",
      "ocrMatch": {
        "txnMatch": "EXACT",
        "amountMatch": "EXACT",
        "confidence": 98
      }
    }
  ]
}
```

---

### 4. POST `/api/accounts/payment-verifications/:id/approve`
Approve a student payment proof and automatically credit their fee balance.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`
- **URL Params**: `id` (Payment Proof ID)
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Payment verified and student fee balance updated successfully.",
  "data": {
    "id": "PAY-1001",
    "status": "APPROVED",
    "verifiedBy": "Accounts Officer (Subhashree Jena)",
    "verifiedAt": "2026-10-05T11:00:00Z"
  }
}
```

---

### 5. POST `/api/accounts/payment-verifications/:id/reject`
Reject a student payment proof with a mandatory rejection reason.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Accounts`, `Admin`
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
  "message": "Payment rejected and student notified.",
  "data": {
    "id": "PAY-1001",
    "status": "REJECTED",
    "rejectionReason": "Transaction ID could not be verified in bank statement."
  }
}
```

---

## Module 2: Class Notes Sharing & Missed Classes

### 1. GET `/api/class-notes`
Fetch faculty-approved student notes with filtering by date, subject, and search query. Notes remain private until a faculty member verifies them.

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
Submit student-generated class notes for faculty review. The authenticated student's profile supplies the uploader and class information; clients cannot choose another student's identity.

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
  "previewUrl": "data:image/jpeg;base64,...",
  "fileName": "lecture_notes.jpg",
  "fileType": "image/jpeg"
}
```
- **Response 201 Created**:
```json
{
  "success": true,
  "message": "Class notes submitted for faculty verification.",
  "data": {
    "id": "NOTE-502",
    "status": "PENDING",
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

### 5. GET `/api/faculty/class-notes/pending`
List student notes awaiting review, scoped to the faculty member's department.

- **Method**: `GET`
- **Authentication**: `Bearer JWT`
- **Role Permissions**: `Faculty`, `HOD`, `Admin`

### 6. POST `/api/faculty/class-notes/:id/verify`
Approve a pending student note and publish it to students.

- **Method**: `POST`
- **Authentication**: `Bearer Token`
- **Role Permissions**: `Faculty`, `Admin`
- **URL Params**: `id`
- **Response 200 OK**:
```json
{
  "success": true,
  "message": "Class note verified and published to students."
}
```

### 7. POST `/api/faculty/class-notes/:id/reject`
Reject a student note so it is not shown in the approved class notes list.

- **Method**: `POST`
- **Authentication**: `Bearer JWT`
- **Role Permissions**: `Faculty`, `HOD`, `Admin`
- **Request Body**: `{ "remarks": "Please upload a clearer scan." }`

---

## Module 3: Student Quizzes & Marks

### 1. GET `/api/exams/student/quizzes`
List live quizzes assigned to the authenticated student's semester and section. Correct answers are not returned.

- **Method**: `GET`
- **Authentication**: `Bearer JWT`
- **Role Permissions**: `Student`

### 2. POST `/api/exams/student/quizzes/:id/submit`
Submit the student's answer map. The backend grades answers, enforces one attempt, stores the submission, and updates the matching quiz slot in `AssessmentMark` in one transaction.

- **Method**: `POST`
- **Authentication**: `Bearer JWT`
- **Role Permissions**: `Student`
- **Request Body**:
```json
{
  "answers": {
    "1": 2,
    "2": 0
  }
}
```

### 3. GET `/api/marks/student`
Return the authenticated student's persisted assessment marks. Student access is always scoped to the current account.

## Module 4: Institutional Notifications & Notices

Notification endpoints require a valid bearer token unless noted otherwise. Recipient records and read state are scoped to the authenticated user; clients must not supply a roll number to select another recipient.

### 1. GET `/api/notifications`
List notifications for the current user. Supports `page`, `limit`, `category`, `priority`, `unreadOnly`, and `search` query parameters. The response includes recipient-specific unread state and pagination metadata.

### 2. GET `/api/notifications/summary`
Return the current user's total, unread, and urgent notification counts.

### 3. POST `/api/notifications/:id/read`
Mark one notification as read for the authenticated recipient.

### 4. POST `/api/notifications/mark-all-read`
Mark eligible notifications as read for the authenticated recipient.

### 5. GET `/api/notifications/faculty`
List notices created by the authenticated faculty/HOD account, including recipient and read counts.

### 6. POST `/api/notifications/faculty/preview-recipients`
Preview eligible students for the supplied department/semester/section criteria. Faculty are limited to their department and assigned classes.

### 7. POST `/api/notifications/faculty`
Create and broadcast a notice to an authorized class cohort. The backend derives the sender identity from the authenticated account and validates department and faculty assignment scope.

### 8. DELETE `/api/notifications/faculty/:id`
Cancel an unread notice created by the authenticated sender.

### 9. GET `/api/cms/notices`
List persisted campus notices. Optional `search` and `tag` query parameters filter the results. This endpoint is public.

### 10. POST `/api/cms/notices`
Create a persisted campus notice. Requires authentication and an authorized administration or leadership role.

### 11. GET `/api/notifications/stream`
Subscribe to server-sent notification events. Authenticate with a bearer token or the `token` query parameter required by browser `EventSource` clients.

## Module 5: Admissions & Student Provisioning

The following endpoints require an authenticated bearer token. Applicant registry and review operations are restricted to authorized admissions and administrative roles.

### 1. GET `/api/admission/applicants`
List applicants. Supports `search`, `status`, `programmeId`, and `academicYear` filters.

### 2. POST `/api/admission/applicants`
Register an applicant using an active `programmeId`. The backend allocates the application number transactionally and validates email, phone, marks, and entrance rank.

### 3. PATCH `/api/admission/applicants/:id/verify`
Mark an application verified after review.

### 4. POST `/api/admission/applicants/:id/approve`
Provision a student, semester-one enrollment, and an inactive student account in one database transaction. Generates a unique `AC-<academic-year>-<sequence>` student ID and an institutional email using `STUDENT_EMAIL_DOMAIN`. The response contains a one-time activation link, valid for 24 hours; successful activation sets the password and consumes the link.
