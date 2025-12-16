/*
  Warnings:

  - You are about to drop the column `location` on the `places` table. All the data in the column will be lost.
  - Added the required column `city` to the `places` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."places" DROP COLUMN "location",
ADD COLUMN     "city" TEXT NOT NULL;
