-- AlterTable
ALTER TABLE "public"."images" ADD COLUMN     "public_id_image" TEXT,
ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."places" ADD COLUMN     "public_id_image" TEXT;
