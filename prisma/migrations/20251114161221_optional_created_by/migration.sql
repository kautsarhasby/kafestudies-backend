-- DropForeignKey
ALTER TABLE "public"."places" DROP CONSTRAINT "places_created_by_id_fkey";

-- AlterTable
ALTER TABLE "places" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
