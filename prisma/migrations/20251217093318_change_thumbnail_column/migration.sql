/*
  Warnings:

  - You are about to drop the column `thumbnail_url` on the `places` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."places" DROP COLUMN "thumbnail_url",
ADD COLUMN     "thumbnail" TEXT;
