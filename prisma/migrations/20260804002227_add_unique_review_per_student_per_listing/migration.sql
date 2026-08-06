/*
  Warnings:

  - A unique constraint covering the columns `[listing_id,student_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_listing_id_student_id_key" ON "reviews"("listing_id", "student_id");
