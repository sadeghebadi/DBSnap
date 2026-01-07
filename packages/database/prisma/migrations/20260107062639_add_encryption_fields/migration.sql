/*
  Warnings:

  - You are about to drop the column `connectionUri` on the `Database` table. All the data in the column will be lost.
  - Added the required column `authTag` to the `Database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `connectionStringEnc` to the `Database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Database` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Database" DROP COLUMN "connectionUri",
ADD COLUMN     "authTag" TEXT NOT NULL,
ADD COLUMN     "connectionStringEnc" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL;
