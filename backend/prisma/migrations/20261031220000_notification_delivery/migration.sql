ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS "sourceModule" TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS "eventType" TEXT,
  ADD COLUMN IF NOT EXISTS "actionTab" TEXT,
  ADD COLUMN IF NOT EXISTS "actionLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "senderId" TEXT,
  ADD COLUMN IF NOT EXISTS "senderName" TEXT,
  ADD COLUMN IF NOT EXISTS "senderRole" TEXT,
  ADD COLUMN IF NOT EXISTS "senderDept" TEXT,
  ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "attachmentName" TEXT,
  ADD COLUMN IF NOT EXISTS "targetScope" TEXT,
  ADD COLUMN IF NOT EXISTS "dedupKey" TEXT,
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

ALTER TABLE "Notification"
  ALTER COLUMN "role" DROP NOT NULL,
  ALTER COLUMN "time" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Notification_dedupKey_key"
  ON "Notification"("dedupKey");
CREATE INDEX IF NOT EXISTS "Notification_sourceModule_idx"
  ON "Notification"("sourceModule");
CREATE INDEX IF NOT EXISTS "Notification_category_idx"
  ON "Notification"("category");
CREATE INDEX IF NOT EXISTS "Notification_priority_idx"
  ON "Notification"("priority");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx"
  ON "Notification"("createdAt");

CREATE TABLE IF NOT EXISTS "NotificationRecipient" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" TEXT,
  "recipientRole" TEXT NOT NULL DEFAULT 'STUDENT',
  "recipientIdentifier" TEXT NOT NULL,
  "recipientName" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "isDismissed" BOOLEAN NOT NULL DEFAULT false,
  "dismissedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "NotificationRecipient_notificationId_fkey"
    FOREIGN KEY ("notificationId") REFERENCES "Notification"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRecipient_notificationId_recipientIdentifier_key"
  ON "NotificationRecipient"("notificationId", "recipientIdentifier");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientIdentifier_isRead_idx"
  ON "NotificationRecipient"("recipientIdentifier", "isRead");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientRole_isRead_idx"
  ON "NotificationRecipient"("recipientRole", "isRead");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isRead_idx"
  ON "NotificationRecipient"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientIdentifier_isDismissed_idx"
  ON "NotificationRecipient"("recipientIdentifier", "isDismissed");

CREATE TABLE IF NOT EXISTS "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userIdentifier" TEXT NOT NULL,
  "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
  "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
  "academicAlerts" BOOLEAN NOT NULL DEFAULT true,
  "financialAlerts" BOOLEAN NOT NULL DEFAULT true,
  "placementAlerts" BOOLEAN NOT NULL DEFAULT true,
  "urgentAlerts" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userIdentifier_key"
  ON "NotificationPreference"("userIdentifier");
