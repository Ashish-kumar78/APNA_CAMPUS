ALTER TABLE "Student"
ADD COLUMN IF NOT EXISTS "personalEmail" TEXT;

CREATE INDEX IF NOT EXISTS "Applicant_email_academicYear_idx"
ON "Applicant"("email", "academicYear");

UPDATE "User"
SET "tokenExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '24 hours'
WHERE "activationToken" IS NOT NULL
  AND "isActivated" = false
  AND "tokenExpiresAt" IS NULL;

CREATE TABLE IF NOT EXISTS "AdmissionSequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdmissionSequence_pkey" PRIMARY KEY ("key")
);

INSERT INTO "AdmissionSequence" ("key", "value", "updatedAt")
SELECT
    'APPLICATION-' || SUBSTRING("applicationNo" FROM '^APP-([0-9]{4})-'),
    MAX(SUBSTRING("applicationNo" FROM '^APP-[0-9]{4}-([0-9]+)$')::INTEGER),
    CURRENT_TIMESTAMP
FROM "Applicant"
WHERE "applicationNo" ~ '^APP-[0-9]{4}-[0-9]+$'
GROUP BY SUBSTRING("applicationNo" FROM '^APP-([0-9]{4})-')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "AdmissionSequence" ("key", "value", "updatedAt")
SELECT
    'STUDENT-' || SUBSTRING("studentId" FROM '^AC-([0-9]{4})-'),
    MAX(SUBSTRING("studentId" FROM '^AC-[0-9]{4}-([0-9]+)$')::INTEGER),
    CURRENT_TIMESTAMP
FROM "Student"
WHERE "studentId" ~ '^AC-[0-9]{4}-[0-9]+$'
GROUP BY SUBSTRING("studentId" FROM '^AC-([0-9]{4})-')
ON CONFLICT ("key") DO NOTHING;
