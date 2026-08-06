/*
  Warnings:

  - You are about to drop the column `reason` on the `reports` table. All the data in the column will be lost.
  - Added the required column `category` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('suspicious_listing', 'fake_photos', 'scam_fraud', 'inappropriate_behaviour', 'fake_contact_info', 'impersonation', 'other');

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "reason",
ADD COLUMN     "category" "ReportCategory" NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "evidence" TEXT[];
