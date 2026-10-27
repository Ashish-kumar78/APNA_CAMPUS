-- AlterTable: Add workflow enhancement, 72h deadline, escalation, verification, and feedback to HostelComplaint
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedWardenId" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedWardenName" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "assignedWardenContact" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "resolutionDeadline" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "isEscalated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "escalationReason" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "workCompletedAt" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "studentVerifiedAt" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "reopenedAt" TIMESTAMP(3);
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "reopenReason" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "reopenAttachmentUrl" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "statusHistory" JSONB;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "feedbackRating" INTEGER;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "feedbackText" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "feedbackResolved" BOOLEAN;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "feedbackAdminComments" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "feedbackSubmittedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "HostelComplaint_assignedWardenName_idx" ON "HostelComplaint"("assignedWardenName");
CREATE INDEX IF NOT EXISTS "HostelComplaint_isEscalated_idx" ON "HostelComplaint"("isEscalated");
CREATE INDEX IF NOT EXISTS "HostelComplaint_resolutionDeadline_idx" ON "HostelComplaint"("resolutionDeadline");
