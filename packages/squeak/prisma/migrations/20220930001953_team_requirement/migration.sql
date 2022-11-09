-- DropForeignKey
ALTER TABLE "squeak_roadmaps" DROP CONSTRAINT "squeak_roadmaps_teamId_fkey";

-- AlterTable
ALTER TABLE "squeak_roadmaps" ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "squeak_roadmaps" ADD CONSTRAINT "squeak_roadmaps_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "squeak_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
