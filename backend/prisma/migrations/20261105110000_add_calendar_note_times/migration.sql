-- AlterTable
ALTER TABLE "calendar_notes" ADD COLUMN IF NOT EXISTS "start_time" TEXT;
ALTER TABLE "calendar_notes" ADD COLUMN IF NOT EXISTS "end_time" TEXT;

