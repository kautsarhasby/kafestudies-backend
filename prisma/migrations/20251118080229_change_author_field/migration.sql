/*
  Warnings:

  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `authorId` on the `reviews` table. All the data in the column will be lost.
  - The required column `author_id` was added to the `reviews` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_authorId_fkey";

-- AlterTable
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_pkey",
DROP COLUMN "authorId",
ADD COLUMN     "author_id" UUID NOT NULL,
ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("author_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
