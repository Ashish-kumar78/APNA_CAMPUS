-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "InternshipCardStatus" AS ENUM ('PENDING', 'ISSUED', 'EXPIRED', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "programmeId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "InternshipIdCard" (
    "id" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "academicSession" TEXT NOT NULL DEFAULT '2026-2027 (SIP)',
    "company" TEXT NOT NULL DEFAULT 'Central Tool Room and Training Center',
    "designation" TEXT DEFAULT 'Industrial Trainee / Intern',
    "mobile" TEXT,
    "photoUrl" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "status" "InternshipCardStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedBy" TEXT NOT NULL DEFAULT 'Internship Cell Coordinator',
    "issuedByUserId" TEXT,
    "verificationToken" TEXT NOT NULL,
    "qrCodeDataUrl" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "revocationReason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "previousCardId" TEXT,
    "reissueReason" TEXT,
    "history" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternshipIdCard_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InternshipIdCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InternshipIdCard_cardNumber_key" ON "InternshipIdCard"("cardNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "InternshipIdCard_verificationToken_key" ON "InternshipIdCard"("verificationToken");
CREATE INDEX IF NOT EXISTS "InternshipIdCard_studentId_idx" ON "InternshipIdCard"("studentId");
CREATE INDEX IF NOT EXISTS "InternshipIdCard_registrationNo_idx" ON "InternshipIdCard"("registrationNo");
CREATE INDEX IF NOT EXISTS "InternshipIdCard_cardNumber_idx" ON "InternshipIdCard"("cardNumber");
CREATE INDEX IF NOT EXISTS "InternshipIdCard_verificationToken_idx" ON "InternshipIdCard"("verificationToken");
CREATE INDEX IF NOT EXISTS "InternshipIdCard_status_idx" ON "InternshipIdCard"("status");
