-- AlterTable
ALTER TABLE "squeak_profiles_readonly" ADD COLUMN     "teamId" BIGINT;

-- CreateTable
CREATE TABLE "squeak_teams" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "squeak_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squeak_roadmaps" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "github_urls" TEXT[],
    "description" TEXT,
    "title" TEXT NOT NULL,
    "date_completed" TIMESTAMPTZ(6),
    "projected_completion_date" TIMESTAMPTZ(6),
    "category" TEXT NOT NULL,
    "milestone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "squeak_roadmaps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "squeak_profiles_readonly" ADD CONSTRAINT "squeak_profiles_readonly_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "squeak_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squeak_roadmaps" ADD CONSTRAINT "squeak_roadmaps_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "squeak_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
