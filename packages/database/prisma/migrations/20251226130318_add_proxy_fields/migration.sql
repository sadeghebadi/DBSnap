-- AlterTable
ALTER TABLE "database_connections" ADD COLUMN     "proxyEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proxyHost" TEXT,
ADD COLUMN     "proxyPassword" TEXT,
ADD COLUMN     "proxyPort" INTEGER,
ADD COLUMN     "proxyType" TEXT,
ADD COLUMN     "proxyUsername" TEXT;
