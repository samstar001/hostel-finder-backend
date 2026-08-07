/*
  Warnings:

  - Added the required column `requested_date` to the `inspection_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "inspection_requests" ADD COLUMN     "message" TEXT,
ADD COLUMN     "requested_date" TIMESTAMP(3) NOT NULL;
