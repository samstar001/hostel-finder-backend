/*
  Warnings:

  - You are about to drop the column `school` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "school",
ADD COLUMN     "home_address" TEXT,
ADD COLUMN     "housing_preference" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "nin" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_picture" TEXT,
ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "pending_registrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "otp" TEXT,
    "otpExpiry" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_registrations_email_key" ON "pending_registrations"("email");
