-- AlterTable: Add AI fields, location, description, and staff assignment fields to HostelComplaint
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "predictedCategory" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "needsReview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "reviewReason" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedStaffId" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedStaffName" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedStaffPhone" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedStaffRole" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HostelComplaint_rollNumber_idx" ON "HostelComplaint"("rollNumber");
CREATE INDEX IF NOT EXISTS "HostelComplaint_category_idx" ON "HostelComplaint"("category");
CREATE INDEX IF NOT EXISTS "HostelComplaint_status_idx" ON "HostelComplaint"("status");
CREATE INDEX IF NOT EXISTS "HostelComplaint_assignedStaffId_idx" ON "HostelComplaint"("assignedStaffId");
