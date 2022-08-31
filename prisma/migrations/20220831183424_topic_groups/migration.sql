-- AlterTable
ALTER TABLE "squeak_topics" ADD COLUMN     "topicGroupId" BIGINT;

-- CreateTable
CREATE TABLE "squeak_topic_groups" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" TEXT NOT NULL,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "squeak_topic_groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "squeak_topics" ADD CONSTRAINT "squeak_topics_topicGroupId_fkey" FOREIGN KEY ("topicGroupId") REFERENCES "squeak_topic_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
