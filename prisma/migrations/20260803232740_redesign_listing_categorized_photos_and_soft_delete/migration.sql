/*
  Warnings:

  - You are about to drop the column `photos` on the `listings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listings" DROP COLUMN "photos",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "hostel_rules" TEXT[],
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legal_documents" TEXT[],
ADD COLUMN     "photo_bathroom" TEXT,
ADD COLUMN     "photo_compound" TEXT,
ADD COLUMN     "photo_kitchen" TEXT,
ADD COLUMN     "photo_room" TEXT,
ADD COLUMN     "photo_toilet" TEXT;
