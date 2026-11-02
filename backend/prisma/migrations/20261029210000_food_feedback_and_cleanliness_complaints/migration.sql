-- AlterTable: Add Cleanliness Complaint fields to HostelComplaint
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "block" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "floor" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "preferredTime" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "cleaningInstructions" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "resolvedBy" TEXT;
ALTER TABLE "HostelComplaint" ADD COLUMN IF NOT EXISTS "studentVerificationResult" TEXT;

-- CreateTable: FoodFeedback
CREATE TABLE IF NOT EXISTS "FoodFeedback" (
    "id" TEXT NOT NULL,
    "feedbackCode" TEXT NOT NULL,
    "studentId" TEXT,
    "studentName" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "hostelId" TEXT,
    "hostelName" TEXT NOT NULL,
    "mealDate" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodItems" TEXT NOT NULL,
    "qualityRating" INTEGER NOT NULL DEFAULT 5,
    "tasteRating" INTEGER NOT NULL DEFAULT 5,
    "temperatureRating" INTEGER NOT NULL DEFAULT 5,
    "hygieneRating" INTEGER NOT NULL DEFAULT 5,
    "quantity" TEXT NOT NULL DEFAULT 'Appropriate',
    "overallRating" INTEGER NOT NULL DEFAULT 5,
    "category" TEXT NOT NULL DEFAULT 'Taste',
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "assignedWarden" TEXT,
    "internalNotes" TEXT,
    "response" TEXT,
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "correctiveAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MessMenuSchedule
CREATE TABLE IF NOT EXISTS "MessMenuSchedule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "timing" TEXT NOT NULL,
    "calories" TEXT,
    "hostel" TEXT DEFAULT 'All Hostels',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessMenuSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FoodFeedback_feedbackCode_key" ON "FoodFeedback"("feedbackCode");
CREATE INDEX IF NOT EXISTS "FoodFeedback_rollNumber_idx" ON "FoodFeedback"("rollNumber");
CREATE INDEX IF NOT EXISTS "FoodFeedback_hostelName_idx" ON "FoodFeedback"("hostelName");
CREATE INDEX IF NOT EXISTS "FoodFeedback_mealDate_idx" ON "FoodFeedback"("mealDate");
CREATE INDEX IF NOT EXISTS "FoodFeedback_status_idx" ON "FoodFeedback"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MessMenuSchedule_dayOfWeek_mealType_key" ON "MessMenuSchedule"("dayOfWeek", "mealType");

