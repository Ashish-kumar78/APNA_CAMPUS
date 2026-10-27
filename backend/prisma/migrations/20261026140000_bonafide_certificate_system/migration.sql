-- CreateEnum
CREATE TYPE "BonafidePurpose" AS ENUM ('INTERNSHIP', 'SCHOLARSHIP_HOSTELLER', 'STUDY_LOAN', 'EXTERNAL_EVENT');

-- CreateEnum
CREATE TYPE "BonafideStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'REJECTED', 'APPROVED', 'CERTIFICATE_ISSUED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BonafideStage" AS ENUM ('STUDENT_SUBMISSION', 'PLACEMENT_VERIFICATION', 'SCHOLARSHIP_INITIAL_VERIFICATION', 'PRINCIPAL_APPROVAL', 'SCHOLARSHIP_FINAL_APPROVAL', 'COMPLETED');

-- CreateTable
CREATE TABLE "bonafide_applications" (
    "id" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentRoll" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "purpose" "BonafidePurpose" NOT NULL,
    "purposeTitle" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026-27',
    "status" "BonafideStatus" NOT NULL DEFAULT 'SUBMITTED',
    "currentStage" "BonafideStage" NOT NULL DEFAULT 'STUDENT_SUBMISSION',
    "currentStageLabel" TEXT NOT NULL DEFAULT 'Submitted by Student',
    "assignedRole" TEXT NOT NULL,
    "isHostellerVerified" BOOLEAN NOT NULL DEFAULT false,
    "formData" JSONB NOT NULL,
    "supportingDocs" JSONB DEFAULT '[]',
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "currentRevision" INTEGER NOT NULL DEFAULT 1,
    "rejectionReason" TEXT,
    "rejectionCategory" TEXT,
    "correctionInstructions" TEXT,
    "withdrawnAt" TIMESTAMP(3),
    "withdrawalReason" TEXT,

    CONSTRAINT "bonafide_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonafide_revisions" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "formData" JSONB NOT NULL,
    "supportingDocs" JSONB DEFAULT '[]',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "bonafide_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonafide_reviews" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "stage" "BonafideStage" NOT NULL,
    "stageName" TEXT NOT NULL,
    "assignedRole" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewerName" TEXT NOT NULL,
    "reviewerRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "rejectionCategory" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonafide_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonafide_certificates" (
    "id" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "purpose" "BonafidePurpose" NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "certificateTitle" TEXT NOT NULL,
    "recipient" TEXT,
    "verificationToken" TEXT NOT NULL,
    "qrCodeDataUrl" TEXT,
    "issuedBy" TEXT NOT NULL DEFAULT 'Registrar / Authorized Signatory',
    "issuedByRole" TEXT NOT NULL DEFAULT 'REGISTRAR',
    "pdfUrl" TEXT,
    "meta" JSONB,

    CONSTRAINT "bonafide_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonafide_audit_logs" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "remarks" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bonafide_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bonafide_applications_applicationNumber_key" ON "bonafide_applications"("applicationNumber");

-- CreateIndex
CREATE INDEX "bonafide_applications_studentId_idx" ON "bonafide_applications"("studentId");

-- CreateIndex
CREATE INDEX "bonafide_applications_studentRoll_idx" ON "bonafide_applications"("studentRoll");

-- CreateIndex
CREATE INDEX "bonafide_applications_purpose_idx" ON "bonafide_applications"("purpose");

-- CreateIndex
CREATE INDEX "bonafide_applications_status_idx" ON "bonafide_applications"("status");

-- CreateIndex
CREATE INDEX "bonafide_applications_currentStage_idx" ON "bonafide_applications"("currentStage");

-- CreateIndex
CREATE INDEX "bonafide_applications_assignedRole_idx" ON "bonafide_applications"("assignedRole");

-- CreateIndex
CREATE INDEX "bonafide_revisions_applicationId_idx" ON "bonafide_revisions"("applicationId");

-- CreateIndex
CREATE INDEX "bonafide_reviews_applicationId_idx" ON "bonafide_reviews"("applicationId");

-- CreateIndex
CREATE INDEX "bonafide_reviews_stage_idx" ON "bonafide_reviews"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "bonafide_certificates_certificateNumber_key" ON "bonafide_certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "bonafide_certificates_applicationId_key" ON "bonafide_certificates"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "bonafide_certificates_verificationToken_key" ON "bonafide_certificates"("verificationToken");

-- CreateIndex
CREATE INDEX "bonafide_certificates_applicationId_idx" ON "bonafide_certificates"("applicationId");

-- CreateIndex
CREATE INDEX "bonafide_certificates_verificationToken_idx" ON "bonafide_certificates"("verificationToken");

-- CreateIndex
CREATE INDEX "bonafide_audit_logs_applicationId_idx" ON "bonafide_audit_logs"("applicationId");

-- AddForeignKey
ALTER TABLE "bonafide_applications" ADD CONSTRAINT "bonafide_applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonafide_revisions" ADD CONSTRAINT "bonafide_revisions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "bonafide_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonafide_reviews" ADD CONSTRAINT "bonafide_reviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "bonafide_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonafide_certificates" ADD CONSTRAINT "bonafide_certificates_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "bonafide_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonafide_audit_logs" ADD CONSTRAINT "bonafide_audit_logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "bonafide_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
