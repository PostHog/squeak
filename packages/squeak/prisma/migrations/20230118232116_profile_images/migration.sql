-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID;

-- AlterTable
ALTER TABLE "squeak_profiles" ADD COLUMN     "imageId" TEXT;

-- AddForeignKey
ALTER TABLE "squeak_profiles" ADD CONSTRAINT "squeak_profiles_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
