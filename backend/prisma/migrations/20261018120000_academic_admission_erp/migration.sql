-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMISSIONS';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MAINTENANCE';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'NON_TEACHING';

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ApplicantStatus" AS ENUM ('APPLIED', 'VERIFIED', 'APPROVED', 'REJECTED', 'ENROLLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activationToken" TEXT,
ADD COLUMN IF NOT EXISTS "resetToken" TEXT,
ADD COLUMN IF NOT EXISTS "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isActivated" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "programmeId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Institution" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "address" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "affiliations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Campus" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isMainCampus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Programme" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degreeType" TEXT NOT NULL DEFAULT 'UG',
    "departmentCode" TEXT NOT NULL DEFAULT 'CSE',
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "totalSemesters" INTEGER NOT NULL DEFAULT 8,
    "creditsRequired" INTEGER NOT NULL DEFAULT 160,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AcademicYear" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TEXT,
    "endDate" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Applicant" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'Not Specified',
    "dob" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "programmeId" TEXT,
    "programmeName" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "tenthMarks" DOUBLE PRECISION,
    "twelfthMarks" DOUBLE PRECISION,
    "entranceExam" TEXT,
    "entranceRank" INTEGER,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'APPLIED',
    "verifiedBy" TEXT,
    "approvedBy" TEXT,
    "rejectionReason" TEXT,
    "documents" JSONB DEFAULT '[]',
    "studentId" TEXT,
    "enrolledUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "programmeId" TEXT,
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "semester" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'Section A',
    "status" TEXT NOT NULL DEFAULT 'Enrolled',
    "sgpa" DOUBLE PRECISION,
    "cgpa" DOUBLE PRECISION,
    "attendanceRate" DOUBLE PRECISION,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promotedAt" TIMESTAMP(3),

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CourseOffering" (
    "id" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "programmeId" TEXT,
    "department" TEXT NOT NULL DEFAULT 'CSE',
    "semester" TEXT NOT NULL DEFAULT 'Semester 5',
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "credits" INTEGER NOT NULL DEFAULT 4,
    "type" TEXT NOT NULL DEFAULT 'Theory + Lab',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FacultyAssignment" (
    "id" TEXT NOT NULL,
    "courseOfferingId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'Section A',
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "role" TEXT NOT NULL DEFAULT 'Lead Instructor',
    "allocatedHours" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" TEXT,
    "permissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Institution_code_key" ON "Institution"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Campus_code_key" ON "Campus"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "Programme_code_key" ON "Programme"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "AcademicYear_year_key" ON "AcademicYear"("year");
CREATE UNIQUE INDEX IF NOT EXISTS "Applicant_applicationNo_key" ON "Applicant"("applicationNo");
CREATE INDEX IF NOT EXISTS "Applicant_applicationNo_idx" ON "Applicant"("applicationNo");
CREATE INDEX IF NOT EXISTS "Applicant_status_idx" ON "Applicant"("status");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_studentId_idx" ON "StudentEnrollment"("studentId");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_academicYear_idx" ON "StudentEnrollment"("academicYear");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_semester_idx" ON "StudentEnrollment"("semester");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseOffering_subjectCode_academicYear_semester_key" ON "CourseOffering"("subjectCode", "academicYear", "semester");
CREATE UNIQUE INDEX IF NOT EXISTS "FacultyAssignment_courseOfferingId_facultyId_section_key" ON "FacultyAssignment"("courseOfferingId", "facultyId", "section");
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_slug_key" ON "Permission"("slug");
CREATE INDEX IF NOT EXISTS "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX IF NOT EXISTS "UserRole_role_idx" ON "UserRole"("role");
CREATE UNIQUE INDEX IF NOT EXISTS "User_activationToken_key" ON "User"("activationToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Student" ADD CONSTRAINT "Student_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Campus" ADD CONSTRAINT "Campus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "FacultyAssignment" ADD CONSTRAINT "FacultyAssignment_courseOfferingId_fkey" FOREIGN KEY ("courseOfferingId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "FacultyAssignment" ADD CONSTRAINT "FacultyAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
