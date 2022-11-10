-- AlterTable
ALTER TABLE "squeak_roadmaps" ADD COLUMN     "imageId" TEXT;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "cloud_name" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_publicId_key" ON "Image"("publicId");

-- AddForeignKey
ALTER TABLE "squeak_roadmaps" ADD CONSTRAINT "squeak_roadmaps_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
