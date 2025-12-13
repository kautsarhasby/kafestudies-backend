/*
  Warnings:

  - You are about to drop the column `is_google` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."provider" AS ENUM ('GOOGLE', 'LOCAL');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "is_google",
ADD COLUMN     "provider" "public"."provider" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "providerId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
