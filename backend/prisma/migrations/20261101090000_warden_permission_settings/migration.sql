CREATE TABLE "WardenPermissionSetting" (
    "id" TEXT NOT NULL,
    "wardenId" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WardenPermissionSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WardenPermissionSetting_wardenId_key" ON "WardenPermissionSetting"("wardenId");
