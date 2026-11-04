# CollegeFlow NestJS Backend

NestJS API that mirrors the existing frontend contract.

## Commands

```bash
npm install
npm run start:dev
```

The API runs on `http://localhost:4000` by default.

## Admissions

Admission officers can register applicants with `POST /api/admission/applicants`,
verify them, and provision a student account after approval with
`POST /api/admission/applicants/:id/approve`. Application numbers and student IDs
are allocated with transactional database sequences. Student IDs use the
`AC-<academic-year>-<sequence>` format, and the associated institutional email
uses `STUDENT_EMAIL_DOMAIN` (defaults to `apnacampus.edu.in`).

The approval response includes a one-time account activation link. It expires
after 24 hours; activation sets the student's password and consumes the token.
The student's submitted email is retained as their contact email while the
official institutional address is used for account login.

## Routes

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/dashboard`
- `POST /api/auth/logout`

Demo credentials use `password123` for:

- `student@collegeflow.edu`
- `admin@collegeflow.edu`
- `faculty@collegeflow.edu`
