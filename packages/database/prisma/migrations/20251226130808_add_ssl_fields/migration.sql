-- AlterTable
ALTER TABLE "database_connections" ADD COLUMN     "sslCA" TEXT,
ADD COLUMN     "sslCert" TEXT,
ADD COLUMN     "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sslKey" TEXT;
