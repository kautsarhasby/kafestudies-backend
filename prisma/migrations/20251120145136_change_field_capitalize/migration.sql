/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `places` table. All the data in the column will be lost.
  - You are about to drop the column `isGoogle` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "places" DROP COLUMN "thumbnailUrl",
ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isGoogle",
ADD COLUMN     "is_google" BOOLEAN NOT NULL DEFAULT false;
