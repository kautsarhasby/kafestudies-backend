/*
  Warnings:

  - You are about to drop the column `open_hours` on the `places` table. All the data in the column will be lost.
  - Added the required column `work_hours` to the `places` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."places" DROP COLUMN "open_hours",
ADD COLUMN     "work_hours" JSONB NOT NULL;
