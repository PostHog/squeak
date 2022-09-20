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

-- AddForeignKey
ALTER TABLE "squeak_profiles_readonly" ADD CONSTRAINT "squeak_profiles_readonly_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "squeak_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
