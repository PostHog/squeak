BEGIN;

ALTER TABLE "squeak_profiles"
    ADD COLUMN     "organization_id" UUID,
    ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
    ADD COLUMN     "slack_user_id" TEXT,
    ADD COLUMN     "team_id" BIGINT,
    ADD COLUMN     "user_id" UUID;

UPDATE squeak_profiles as profile SET
    team_id = merged_profile.team_id,
    organization_id = merged_profile.organization_id,
    slack_user_id = merged_profile.slack_user_id,
    user_id = merged_profile.user_id,
    role = merged_profile.role
FROM (
    SELECT
        squeak_profiles.id::uuid id,
        readonly.user_id user_id,
        readonly.organization_id,
        COALESCE(readonly.role, 'user') role,
        readonly.slack_user_id,
        readonly."teamId" team_id
    FROM squeak_profiles_readonly readonly
        INNER JOIN squeak_profiles on squeak_profiles.id = readonly.profile_id
    WHERE readonly.organization_id IS NOT NULL
) AS merged_profile
WHERE merged_profile.id = profile.id AND merged_profile.organization_id IS NOT NULL;

ALTER TABLE "squeak_profiles" ALTER COLUMN "organization_id" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "squeak_profiles" ADD CONSTRAINT "squeak_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "squeak_organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "squeak_profiles" ADD CONSTRAINT "squeak_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "squeak_profiles" ADD CONSTRAINT "squeak_profiles_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "squeak_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

-- Drop the squeak_profiles_readonly table

ALTER TABLE "squeak_profiles_readonly" DROP CONSTRAINT "profiles_readonly_organizations_id_fkey";
ALTER TABLE "squeak_profiles_readonly" DROP CONSTRAINT "profiles_readonly_profile_id_fkey";
ALTER TABLE "squeak_profiles_readonly" DROP CONSTRAINT "profiles_readonly_user_id_fkey";
ALTER TABLE "squeak_profiles_readonly" DROP CONSTRAINT "squeak_profiles_readonly_teamId_fkey";

DROP TABLE "squeak_profiles_readonly";
