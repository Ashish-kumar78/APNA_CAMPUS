import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Applying Notification and NotificationRecipient schema updates...');

  await prisma.$executeRawUnsafe(`
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
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Notification_dedupKey_key" ON "Notification"("dedupKey");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_sourceModule_idx" ON "Notification"("sourceModule");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_category_idx" ON "Notification"("category");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_priority_idx" ON "Notification"("priority");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");
  `);

  await prisma.$executeRawUnsafe(`
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
      CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "NotificationRecipient_notificationId_recipientIdentifier_key" ON "NotificationRecipient"("notificationId", "recipientIdentifier");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientIdentifier_isRead_idx" ON "NotificationRecipient"("recipientIdentifier", "isRead");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientRole_isRead_idx" ON "NotificationRecipient"("recipientRole", "isRead");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "NotificationRecipient_userId_isRead_idx" ON "NotificationRecipient"("userId", "isRead");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "NotificationRecipient_recipientIdentifier_isDismissed_idx" ON "NotificationRecipient"("recipientIdentifier", "isDismissed");
  `);

  await prisma.$executeRawUnsafe(`
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
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userIdentifier_key" ON "NotificationPreference"("userIdentifier");
  `);

  console.log('Schema migration applied successfully without data loss!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
