-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "ignorePlanLimits" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "legalHold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overrideMaxConnections" INTEGER,
ADD COLUMN     "overrideMaxSnapshots" INTEGER,
ADD COLUMN     "overrideStorageLimitGb" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "userId" TEXT,
    "orgId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
