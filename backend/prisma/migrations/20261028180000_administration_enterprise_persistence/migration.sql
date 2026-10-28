-- AlterTable AuditLog: Add tamper-evident administration event metadata
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "action" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "target" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "oldValue" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "newValue" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'Success';
CREATE INDEX IF NOT EXISTS "AuditLog_user_idx" ON "AuditLog"("user");
CREATE INDEX IF NOT EXISTS "AuditLog_role_idx" ON "AuditLog"("role");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateTable SecurityIncident
CREATE TABLE IF NOT EXISTS "SecurityIncident" (
    "id" TEXT NOT NULL,
    "incidentCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "affectedAccount" TEXT NOT NULL,
    "sourceIp" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidence" TEXT,
    "resolutionNotes" TEXT,
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityIncident_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SecurityIncident_incidentCode_key" ON "SecurityIncident"("incidentCode");
CREATE INDEX IF NOT EXISTS "SecurityIncident_status_idx" ON "SecurityIncident"("status");
CREATE INDEX IF NOT EXISTS "SecurityIncident_severity_idx" ON "SecurityIncident"("severity");

-- CreateTable SystemLog
CREATE TABLE IF NOT EXISTS "SystemLog" (
    "id" TEXT NOT NULL,
    "logCode" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "requestId" TEXT,
    "message" TEXT NOT NULL,
    "latencyMs" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SystemLog_level_idx" ON "SystemLog"("level");
CREATE INDEX IF NOT EXISTS "SystemLog_component_idx" ON "SystemLog"("component");
CREATE INDEX IF NOT EXISTS "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");

-- CreateTable UserSession
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserSession_sessionToken_key" ON "UserSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "UserSession_identifier_idx" ON "UserSession"("identifier");
CREATE INDEX IF NOT EXISTS "UserSession_status_idx" ON "UserSession"("status");

-- CreateTable IntegrationConfig
CREATE TABLE IF NOT EXISTS "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "authType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "latencyMs" INTEGER NOT NULL DEFAULT 20,
    "lastPing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationConfig_key_key" ON "IntegrationConfig"("key");
CREATE INDEX IF NOT EXISTS "IntegrationConfig_key_idx" ON "IntegrationConfig"("key");

-- CreateTable BackupSnapshot
CREATE TABLE IF NOT EXISTS "BackupSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotCode" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "databaseVersion" TEXT NOT NULL DEFAULT 'PostgreSQL 16.3',
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "checksum" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BackupSnapshot_snapshotCode_key" ON "BackupSnapshot"("snapshotCode");
CREATE INDEX IF NOT EXISTS "BackupSnapshot_status_idx" ON "BackupSnapshot"("status");

-- CreateTable AdministrativeApproval
CREATE TABLE IF NOT EXISTS "AdministrativeApproval" (
    "id" TEXT NOT NULL,
    "approvalCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requesterName" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scope" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "impactStatement" TEXT,
    "actionHistory" JSONB NOT NULL DEFAULT '[]',
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,
    "decisionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdministrativeApproval_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdministrativeApproval_approvalCode_key" ON "AdministrativeApproval"("approvalCode");
CREATE INDEX IF NOT EXISTS "AdministrativeApproval_status_idx" ON "AdministrativeApproval"("status");
