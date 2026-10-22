# CollegeFlow — API Contract Specification

This document defines the RESTful API endpoints for the **Digital Fee Payment Proof & Verification** module and **Class Notes Sharing / Missed Class** module.

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
